import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Using node's native zip extraction or simple powershell script helper
import { execSync } from 'child_process';

const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('trabalho/AV3-UJ.docx')
$e = $z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$s = $e.Open()
$r = New-Object System.IO.StreamReader($s)
$t = $r.ReadToEnd()
$r.Close()
$s.Close()
$z.Dispose()
$clean = [System.Text.RegularExpressions.Regex]::Replace($t, '<w:p[^>]*>', "\`n")
$clean = [System.Text.RegularExpressions.Regex]::Replace($clean, '<[^>]+>', ' ')
$clean = [System.Text.RegularExpressions.Regex]::Replace($clean, ' +', ' ')
[System.IO.File]::WriteAllText('trabalho/conteudo.txt', $clean, [System.Text.Encoding]::UTF8)
`;

fs.writeFileSync('trabalho/extract.ps1', psScript, 'utf8');
execSync('powershell -ExecutionPolicy Bypass -File trabalho/extract.ps1', { stdio: 'inherit' });
const content = fs.readFileSync('trabalho/conteudo.txt', 'utf8');
console.log(content.substring(0, 3000));
