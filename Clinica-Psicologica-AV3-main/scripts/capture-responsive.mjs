import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const apiUrl = 'http://localhost:3001/api';
const outputDir = path.resolve('docs/evidencias');
const browserPath = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium_headless_shell-1228', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
const profileDir = path.join(os.tmpdir(), `psicomanager-capture-${process.pid}`);
const debugPort = 9337;

const login = await fetch(`${apiUrl}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'dra.sofia@psicomanager.com.br', senha: '123456' })
});
if (!login.ok) throw new Error(`Login de demonstração falhou: HTTP ${login.status}`);
const cookieHeader = login.headers.get('set-cookie') || '';
const cookie = cookieHeader.match(/psico_token=([^;]+)/)?.[1];
if (!cookie) throw new Error('A API não retornou o cookie de sessão esperado.');

await mkdir(outputDir, { recursive: true });
const browser = spawn(browserPath, [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*',
  `--user-data-dir=${profileDir}`, 'about:blank'
], { stdio: 'ignore', windowsHide: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let version;
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    version = await (await fetch(`http://localhost:${debugPort}/json/version`)).json();
    break;
  } catch {
    if (browser.exitCode !== null) throw new Error('Chromium encerrou antes de iniciar o protocolo remoto.');
    await delay(100);
  }
}
if (!version) throw new Error('Não foi possível iniciar o Chromium headless.');

const tab = await (await fetch(`http://localhost:${debugPort}/json/new?${baseUrl}/dashboard`, { method: 'PUT' })).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

try {
  await cdp('Page.enable');
  await cdp('Network.enable');
  await cdp('Network.setCookie', { name: 'psico_token', value: cookie, url: `${baseUrl}/api`, path: '/api', httpOnly: true, sameSite: 'Strict' });

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844, isMobile: true },
    { name: 'tablet', width: 768, height: 1024, isMobile: true },
    { name: 'desktop', width: 1440, height: 900, isMobile: false }
  ]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.isMobile });
    await cdp('Page.navigate', { url: `${baseUrl}/dashboard` });
    await delay(1100);
    const result = await cdp('Runtime.evaluate', { expression: 'JSON.stringify({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, page: location.pathname })', returnByValue: true });
    const metrics = JSON.parse(result.result.value);
    if (metrics.documentWidth > metrics.width) throw new Error(`${viewport.name}: overflow horizontal (${metrics.documentWidth}px > ${metrics.width}px).`);
    const screenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
    await writeFile(path.join(outputDir, `dashboard-${viewport.name}.png`), Buffer.from(screenshot.data, 'base64'));
    console.log(`${viewport.name}: ${metrics.width}px viewport, ${metrics.documentWidth}px document; screenshot saved.`);
  }
} finally {
  socket.close();
  browser.kill();
  await delay(200);
  await rm(profileDir, { recursive: true, force: true });
}
