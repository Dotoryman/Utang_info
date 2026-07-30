export type AuthUser = {
  id: string | number;
  email: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

export type MeResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};

export type LoginResponse = {
  ok: boolean;
  message?: string;
  user?: AuthUser;
};
