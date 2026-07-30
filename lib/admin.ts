export const ADMIN_USER_PAGE_SIZE = 12;

export function parseAdminPage(value: string | null): number {
  const page = Number.parseInt(value ?? "", 10);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function canViewAdminUsers(role: string): boolean {
  return role === "admin";
}
