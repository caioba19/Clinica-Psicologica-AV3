import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const envelopePrefix = 'enc:v1:';

function resolveKey(key = process.env.CLINICAL_DATA_KEY): Buffer {
  if (!key || !/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('Configure CLINICAL_DATA_KEY com 64 caracteres hexadecimais (32 bytes).');
  }
  return Buffer.from(key, 'hex');
}

export function encryptClinicalText(value: string | null | undefined, key?: string): string | null {
  if (value == null || value === '') return value ?? null;
  if (value.startsWith(envelopePrefix)) return value;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', resolveKey(key), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${envelopePrefix}${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

export function decryptClinicalText(value: string | null | undefined, key?: string): string | null {
  if (value == null || value === '') return value ?? null;
  if (!value.startsWith(envelopePrefix)) return value;
  const [ivPart, tagPart, contentPart] = value.slice(envelopePrefix.length).split(':');
  if (!ivPart || !tagPart || !contentPart) throw new Error('Registro clínico criptografado inválido.');
  const decipher = createDecipheriv('aes-256-gcm', resolveKey(key), Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(contentPart, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}
