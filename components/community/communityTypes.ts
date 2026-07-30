import type { AuthUser } from "../auth/authTypes";

export type CommunityPostSummary = {
  id: string;
  title: string;
  isNotice: boolean;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunityPost = CommunityPostSummary & {
  content: string;
};

export type CommunityListResponse = {
  ok: boolean;
  posts: CommunityPostSummary[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
};

export type CommunityPostResponse = {
  ok: boolean;
  post?: CommunityPost;
  message?: string;
};

export type CommunityMutationResponse = {
  ok: boolean;
  post?: CommunityPost;
  message?: string;
};

export type CommunityViewer = Pick<AuthUser, "id" | "role">;
