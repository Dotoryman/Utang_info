export type AdminUser = {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  role: string;
  createdAt: string;
};

export type AdminUserListResponse = {
  ok: boolean;
  message?: string;
  users?: AdminUser[];
  summary?: {
    totalUsers: number;
    totalAdmins: number;
    totalResidents: number;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
