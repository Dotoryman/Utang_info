export type NotificationItem = {
  id: string;
  postId: string;
  type: "comment" | "like";
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationResponse = {
  ok: boolean;
  message?: string;
  notifications?: NotificationItem[];
  unreadCount?: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
