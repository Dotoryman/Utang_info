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
  storage?: {
    usedBytes: number;
    limitBytes: number;
    remainingBytes: number;
    objectCount: number;
    usagePercent: number;
  } | null;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type AdminUserDeleteResponse = {
  ok: boolean;
  message?: string;
  deletedUser?: {
    id: string;
    nickname: string;
  };
  imageCleanupPending?: boolean;
};
