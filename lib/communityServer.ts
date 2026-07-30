import { comments, posts, users } from "../db/schema";

export const communityPostSelection = {
  id: posts.id,
  title: posts.title,
  content: posts.content,
  isNotice: posts.isNotice,
  viewCount: posts.viewCount,
  authorId: posts.authorId,
  authorNickname: users.nickname,
  authorProfileImage: users.profileImage,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
};

export const communityPostSummarySelection = {
  id: posts.id,
  title: posts.title,
  isNotice: posts.isNotice,
  viewCount: posts.viewCount,
  authorId: posts.authorId,
  authorNickname: users.nickname,
  authorProfileImage: users.profileImage,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
};

type CommunityPostSummaryRow = {
  id: string;
  title: string;
  isNotice: boolean;
  viewCount: number;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityPostRow = CommunityPostSummaryRow & {
  content: string;
};

export function serializeCommunityPostSummary(
  row: CommunityPostSummaryRow,
) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeCommunityPost(row: CommunityPostRow) {
  return serializeCommunityPostSummary(row);
}

export const communityCommentSelection = {
  id: comments.id,
  postId: comments.postId,
  authorId: comments.authorId,
  authorNickname: users.nickname,
  authorProfileImage: users.profileImage,
  content: comments.content,
  createdAt: comments.createdAt,
  updatedAt: comments.updatedAt,
};

type CommunityCommentRow = {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeCommunityComment(
  row: CommunityCommentRow,
) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
