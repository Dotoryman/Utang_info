import type { AuthUser } from "../auth/authTypes";

export type CommunityPostSummary = {
  id: string;
  title: string;
  isNotice: boolean;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommunityPostRecord = CommunityPostSummary & {
  content: string;
};

export type CommunityPost = CommunityPostRecord & {
  commentCount: number;
  likeCount: number;
  viewerLiked: boolean;
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
  post?: CommunityPostRecord;
  message?: string;
};

export type CommunityViewer = Pick<AuthUser, "id" | "role">;

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CommunityCommentListResponse = {
  ok: boolean;
  comments: CommunityComment[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
};

export type CommunityCommentMutationResponse = {
  ok: boolean;
  comment?: CommunityComment;
  message?: string;
};

export type CommunityLikeResponse = {
  ok: boolean;
  liked: boolean;
  likeCount: number;
  message?: string;
};

export type CommunityViewResponse = {
  ok: boolean;
  viewCount: number;
  message?: string;
};
