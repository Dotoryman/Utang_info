export const COMMUNITY_PAGE_SIZE = 10;
export const POST_TITLE_MIN_LENGTH = 2;
export const POST_TITLE_MAX_LENGTH = 80;
export const POST_CONTENT_MAX_LENGTH = 5_000;

export type PostInput = {
  title: string;
  content: string;
  isNotice: boolean;
};

export type PostValidationResult =
  | {
      ok: true;
      value: PostInput;
    }
  | {
      ok: false;
      message: string;
    };

export function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function validatePostInput(
  input: unknown,
): PostValidationResult {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      message: "요청 형식이 올바르지 않습니다.",
    };
  }

  const body = input as Record<string, unknown>;
  const title =
    typeof body.title === "string" ? body.title.trim() : "";
  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  const isNotice = body.isNotice === true;

  if (
    title.length < POST_TITLE_MIN_LENGTH ||
    title.length > POST_TITLE_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: `제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  if (!content || content.length > POST_CONTENT_MAX_LENGTH) {
    return {
      ok: false,
      message: `내용은 1자 이상 ${POST_CONTENT_MAX_LENGTH.toLocaleString()}자 이하로 입력해 주세요.`,
    };
  }

  return {
    ok: true,
    value: {
      title,
      content,
      isNotice,
    },
  };
}

export function canEditPost(
  userId: string | number,
  authorId: string,
): boolean {
  return String(userId) === authorId;
}

export function canDeletePost(
  userId: string | number,
  role: string,
  authorId: string,
): boolean {
  return role === "admin" || canEditPost(userId, authorId);
}
