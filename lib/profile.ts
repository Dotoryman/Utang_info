export const PROFILE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const PROFILE_IMAGE_STORAGE_LIMIT_BYTES = 8 * 1024 * 1024 * 1024;
export const PROFILE_NICKNAME_MIN_LENGTH = 2;
export const PROFILE_NICKNAME_MAX_LENGTH = 20;
export const PROFILE_PASSWORD_MIN_LENGTH = 8;
export const PROFILE_PASSWORD_MAX_LENGTH = 128;

export function canStoreProfileImage(input: {
  currentUsageBytes: number;
  previousImageBytes?: number;
  nextImageBytes: number;
}): boolean {
  const projectedUsageBytes =
    input.currentUsageBytes -
    Math.max(0, input.previousImageBytes ?? 0) +
    input.nextImageBytes;

  return projectedUsageBytes <= PROFILE_IMAGE_STORAGE_LIMIT_BYTES;
}

const profileImageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ProfileImageMimeType =
  keyof typeof profileImageExtensions;

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      message: string;
    };

export function validateProfileNickname(
  value: unknown,
): ValidationResult<string> {
  const nickname = typeof value === "string" ? value.trim() : "";

  if (
    nickname.length < PROFILE_NICKNAME_MIN_LENGTH ||
    nickname.length > PROFILE_NICKNAME_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: "닉네임은 2자 이상 20자 이하로 입력해 주세요.",
    };
  }

  return {
    ok: true,
    value: nickname,
  };
}

export function validateNewPassword(
  value: unknown,
): ValidationResult<string> {
  const password = typeof value === "string" ? value : "";

  if (
    password.length < PROFILE_PASSWORD_MIN_LENGTH ||
    password.length > PROFILE_PASSWORD_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: "새 비밀번호는 8자 이상 128자 이하로 입력해 주세요.",
    };
  }

  return {
    ok: true,
    value: password,
  };
}

export function validateProfileImageMetadata(input: {
  size: number;
  type: string;
}): ValidationResult<{
  contentType: ProfileImageMimeType;
  extension: string;
}> {
  if (input.size <= 0) {
    return {
      ok: false,
      message: "업로드할 이미지를 선택해 주세요.",
    };
  }

  if (input.size > PROFILE_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      message: "이미지는 4MB 이하로 올려주세요.",
    };
  }

  if (!(input.type in profileImageExtensions)) {
    return {
      ok: false,
      message: "JPG, PNG, WebP 이미지만 올릴 수 있어요.",
    };
  }

  const contentType = input.type as ProfileImageMimeType;

  return {
    ok: true,
    value: {
      contentType,
      extension: profileImageExtensions[contentType],
    },
  };
}

export function hasValidProfileImageSignature(
  bytes: Uint8Array,
  contentType: ProfileImageMimeType,
): boolean {
  if (contentType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (contentType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    return (
      bytes.length >= signature.length &&
      signature.every((value, index) => bytes[index] === value)
    );
  }

  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export function createProfileImageObjectKey(extension: string): string {
  return `profile-images/${crypto.randomUUID()}.${extension}`;
}

export function createProfileImageUrl(objectKey: string): string {
  const fileName = objectKey.slice("profile-images/".length);

  return `/api/profile-images/${encodeURIComponent(fileName)}`;
}

export function getProfileImageObjectKey(
  profileImage: string | null,
): string | null {
  const prefix = "/api/profile-images/";

  if (!profileImage?.startsWith(prefix)) {
    return null;
  }

  try {
    const fileName = decodeURIComponent(profileImage.slice(prefix.length));

    if (!/^[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(fileName)) {
      return null;
    }

    return `profile-images/${fileName}`;
  } catch {
    return null;
  }
}
