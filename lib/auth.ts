export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getCookieValue(
  cookieHeader: string | null,
  cookieName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name !== cookieName) {
      continue;
    }

    try {
      return decodeURIComponent(valueParts.join("="));
    } catch {
      return null;
    }
  }

  return null;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /unique constraint|constraint failed.*unique/i.test(error.message)
  );
}
