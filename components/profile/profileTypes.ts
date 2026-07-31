import type { AuthUser } from "../auth/authTypes";

export type ProfileMutationResponse = {
  ok: boolean;
  message?: string;
  user?: AuthUser;
  profileImage?: string | null;
};

export type ProfileActivityResponse = {
  ok: boolean;
  message?: string;
  summary?: {
    postCount: number;
    commentCount: number;
    receivedLikeCount: number;
  };
  recentPosts?: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  recentComments?: Array<{
    id: string;
    postId: string;
    postTitle: string;
    content: string;
    createdAt: string;
  }>;
};
