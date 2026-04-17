import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
} from "node:crypto";

function getApplicationSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET precisa ter pelo menos 32 caracteres.");
  }

  return secret;
}

function getEncryptionKey() {
  return scryptSync(getApplicationSecret(), "rateio-contas-security", 32);
}

export function hashOpaqueToken(token: string) {
  return createHmac("sha256", getApplicationSecret()).update(token).digest("hex");
}

export function encryptOpaqueToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptOpaqueToken(payload: string) {
  const decodedPayload = Buffer.from(payload, "base64url");
  const iv = decodedPayload.subarray(0, 12);
  const authTag = decodedPayload.subarray(12, 28);
  const encrypted = decodedPayload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
