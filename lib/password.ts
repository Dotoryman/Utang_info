const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = "SHA-256";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: HASH_ALGORITHM,
      salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const hash = new Uint8Array(derivedBits);

  return [
    "pbkdf2",
    HASH_ALGORITHM.toLowerCase(),
    ITERATIONS.toString(),
    bytesToBase64(salt),
    bytesToBase64(hash),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedPassword: string,
): Promise<boolean> {
  const [algorithm, hashAlgorithm, iterationsText, saltText, hashText] =
    storedPassword.split("$");

  if (
    algorithm !== "pbkdf2" ||
    !hashAlgorithm ||
    !iterationsText ||
    !saltText ||
    !hashText
  ) {
    return false;
  }

  const iterations = Number(iterationsText);

  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const salt = base64ToBytes(saltText);
  const expectedHash = base64ToBytes(hashText);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: hashAlgorithm.toUpperCase(),
      salt,
      iterations,
    },
    keyMaterial,
    expectedHash.byteLength * 8,
  );

  const actualHash = new Uint8Array(derivedBits);

  if (actualHash.byteLength !== expectedHash.byteLength) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < actualHash.byteLength; index += 1) {
    difference |= actualHash[index] ^ expectedHash[index];
  }

  return difference === 0;
}