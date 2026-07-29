const ITERATIONS = 100_000;
const MAX_SUPPORTED_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = "SHA-256";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);

  // ArrayBuffer를 명시적으로 생성해 BufferSource 타입과 호환시킨다.
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

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

  if (
    !Number.isInteger(iterations) ||
    iterations <= 0 ||
    iterations > MAX_SUPPORTED_ITERATIONS
  ) {
    return false;
  }

  let salt: Uint8Array<ArrayBuffer>;
  let expectedHash: Uint8Array<ArrayBuffer>;

  try {
    salt = base64ToBytes(saltText);
    expectedHash = base64ToBytes(hashText);
  } catch {
    return false;
  }

  if (salt.byteLength === 0 || expectedHash.byteLength === 0) {
    return false;
  }

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

  // 해시 비교 시간이 값에 따라 달라지지 않도록 전체 바이트를 비교한다.
  let difference = 0;

  for (let index = 0; index < actualHash.byteLength; index += 1) {
    difference |= actualHash[index] ^ expectedHash[index];
  }

  return difference === 0;
}