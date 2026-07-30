import { users } from "../db/schema";
import { posts } from "../db/schema";

export const communityPostSelection = {
  id: posts.id,
  title: posts.title,
  content: posts.content,
  isNotice: posts.isNotice,
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
