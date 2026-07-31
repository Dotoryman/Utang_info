export const NOTIFICATION_PAGE_SIZE = 20;

export type NotificationType = "comment" | "like";

export function parseNotificationPage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}
