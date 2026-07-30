"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { CommunityAvatar } from "./CommunityAvatar";
import { CommunityConfirmModal } from "./CommunityConfirmModal";
import { CommunitySuccessModal } from "./CommunitySuccessModal";
import styles from "./Community.module.css";
import type {
  CommunityComment,
  CommunityCommentListResponse,
  CommunityCommentMutationResponse,
  CommunityViewer,
} from "./communityTypes";

type CommunityCommentSectionProps = {
  postId: string;
  viewer: CommunityViewer | null;
  onCommentCountChange: (count: number) => void;
};

const COMMENT_MAX_LENGTH = 500;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CommunityCommentSection({
  postId,
  viewer,
  onCommentCountChange,
}: CommunityCommentSectionProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<CommunityComment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadInitialComments() {
      try {
        const response = await fetch(
          `/api/posts/${postId}/comments?page=1`,
          {
            cache: "no-store",
          },
        );
        const result =
          (await response.json()) as CommunityCommentListResponse;

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message ?? "댓글을 불러오지 못했어요.",
          );
        }

        if (isActive) {
          setComments(result.comments);
          setPage(result.pagination.page);
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
          onCommentCountChange(result.pagination.totalItems);
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error
              ? error.message
              : "댓글을 불러오지 못했어요.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialComments();

    return () => {
      isActive = false;
    };
  }, [onCommentCountChange, postId]);

  async function loadMoreComments() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?page=${nextPage}`,
        {
          cache: "no-store",
        },
      );
      const result =
        (await response.json()) as CommunityCommentListResponse;

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ?? "댓글을 더 불러오지 못했어요.",
        );
      }

      setComments((current) => [
        ...current,
        ...result.comments.filter(
          (comment) =>
            !current.some((item) => item.id === comment.id),
        ),
      ]);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
      onCommentCountChange(result.pagination.totalItems);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "댓글을 더 불러오지 못했어요.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function submitComment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: draft,
          }),
        },
      );
      const result =
        (await response.json()) as CommunityCommentMutationResponse;

      if (!response.ok || !result.ok || !result.comment) {
        throw new Error(
          result.message ?? "댓글을 남기지 못했어요.",
        );
      }

      setComments((current) => [result.comment!, ...current]);
      setDraft("");
      setTotalItems((current) => {
        const nextCount = current + 1;
        onCommentCountChange(nextCount);
        return nextCount;
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "댓글을 남기지 못했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(comment: CommunityComment) {
    setEditingId(comment.id);
    setEditingContent(comment.content);
    setMessage("");
  }

  async function saveComment(commentId: string) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: editingContent,
        }),
      });
      const result =
        (await response.json()) as CommunityCommentMutationResponse;

      if (!response.ok || !result.ok || !result.comment) {
        throw new Error(
          result.message ?? "댓글을 수정하지 못했어요.",
        );
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === result.comment!.id
            ? result.comment!
            : comment,
        ),
      );
      setIsEditConfirmOpen(false);
      setEditingId(null);
      setEditingContent("");
      setSuccessMessage("수정되었숭");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "댓글을 수정하지 못했어요.",
      );
      setIsEditConfirmOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteComment() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/comments/${deleteTarget.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ?? "댓글을 삭제하지 못했어요.",
        );
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== deleteTarget.id),
      );
      setTotalItems((current) => {
        const nextCount = Math.max(0, current - 1);
        onCommentCountChange(nextCount);
        return nextCount;
      });
      setDeleteTarget(null);
      setSuccessMessage("삭제되었숭");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "댓글을 삭제하지 못했어요.",
      );
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      className={styles.commentSection}
      aria-labelledby="community-comments-title"
    >
      <div className={styles.commentHeading}>
        <div>
          <p className={styles.commentEyebrow}>FOREST VOICES</p>
          <h2 id="community-comments-title">
            댓글 <span>{totalItems}</span>
          </h2>
        </div>
        <span className={styles.commentHeadingIcon} aria-hidden="true">
          💬
        </span>
      </div>

      {viewer ? (
        <form
          className={styles.commentForm}
          onSubmit={submitComment}
        >
          <label htmlFor="community-comment">
            광장에 짧은 이야기를 보태주세요.
          </label>
          <textarea
            id="community-comment"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="따뜻한 댓글을 남겨주세요."
            disabled={isSubmitting}
            required
          />
          <div className={styles.commentFormFooter}>
            <span>
              {draft.length}/{COMMENT_MAX_LENGTH}
            </span>
            <button
              type="submit"
              className={styles.commentSubmit}
              disabled={isSubmitting || !draft.trim()}
            >
              {isSubmitting ? "남기는 중..." : "댓글 남기기"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.commentLoginPrompt}>
          <span aria-hidden="true">🔐</span>
          <p>우땅랜드에 입장하면 댓글을 남길 수 있어요.</p>
          <Link href="/">입장하러 가기</Link>
        </div>
      )}

      {message && (
        <p className={styles.message} role="alert">
          {message}
        </p>
      )}

      {isLoading ? (
        <div className={styles.commentState}>
          댓글을 모으고 있어요...
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.commentState}>
          <span aria-hidden="true">🍃</span>
          아직 댓글이 없어요. 첫 인사를 남겨보세요!
        </div>
      ) : (
        <ol className={styles.commentList}>
          {comments.map((comment) => {
            const isAuthor =
              String(viewer?.id) === comment.authorId;
            const canDelete =
              isAuthor || viewer?.role === "admin";
            const isEditing = editingId === comment.id;

            return (
              <li className={styles.commentItem} key={comment.id}>
                <CommunityAvatar
                  profileImage={comment.authorProfileImage}
                  nickname={comment.authorNickname}
                />
                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <strong>{comment.authorNickname}</strong>
                    <time dateTime={comment.createdAt}>
                      {formatDate(comment.createdAt)}
                    </time>
                    {comment.createdAt !== comment.updatedAt && (
                      <span>수정됨</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className={styles.commentEdit}>
                      <textarea
                        value={editingContent}
                        onChange={(event) =>
                          setEditingContent(event.target.value)
                        }
                        maxLength={COMMENT_MAX_LENGTH}
                        disabled={isSaving}
                        aria-label="댓글 수정 내용"
                      />
                      <div className={styles.commentEditActions}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingContent("");
                          }}
                          disabled={isSaving}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditConfirmOpen(true)}
                          disabled={
                            isSaving || !editingContent.trim()
                          }
                        >
                          {isSaving ? "저장 중..." : "저장"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.commentContent}>
                      {comment.content}
                    </p>
                  )}

                  {!isEditing && (isAuthor || canDelete) && (
                    <div className={styles.commentActions}>
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => startEditing(comment)}
                        >
                          수정
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(comment)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {page < totalPages && (
        <button
          type="button"
          className={styles.commentMore}
          onClick={loadMoreComments}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "불러오는 중..." : "댓글 더 보기"}
        </button>
      )}

      <CommunityConfirmModal
        isOpen={isEditConfirmOpen}
        isProcessing={isSaving}
        eyebrow="EDIT COMMENT"
        icon="✏️"
        title="수정하겠숭?"
        description="바꾼 댓글 내용으로 저장할까요?"
        cancelLabel="조금 더 다듬기"
        confirmLabel="수정하기"
        processingLabel="수정하는 중..."
        confirmTone="primary"
        onCancel={() => setIsEditConfirmOpen(false)}
        onConfirm={() => {
          if (editingId) {
            return saveComment(editingId);
          }
        }}
      />

      <CommunityConfirmModal
        isOpen={Boolean(deleteTarget)}
        isProcessing={isDeleting}
        eyebrow="DELETE COMMENT"
        icon="💬"
        title="삭제하겠숭?"
        description="삭제한 댓글은 다시 되돌릴 수 없어요."
        cancelLabel="댓글 남겨두기"
        confirmLabel="삭제하기"
        processingLabel="삭제하는 중..."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteComment}
      />

      <CommunitySuccessModal
        isOpen={Boolean(successMessage)}
        message={successMessage}
        description="댓글에 바로 반영했어요."
        buttonLabel="확인"
        buttonIcon="✓"
        onComplete={() => setSuccessMessage("")}
      />
    </section>
  );
}
