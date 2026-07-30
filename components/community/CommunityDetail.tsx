"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { MeResponse } from "../auth/authTypes";
import { CommunityAvatar } from "./CommunityAvatar";
import { CommunityConfirmModal } from "./CommunityConfirmModal";
import { CommunitySuccessModal } from "./CommunitySuccessModal";
import styles from "./Community.module.css";
import type {
  CommunityPost,
  CommunityPostResponse,
  CommunityViewer,
} from "./communityTypes";

type CommunityDetailProps = {
  postId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CommunityDetail({
  postId,
}: CommunityDetailProps) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [viewer, setViewer] = useState<CommunityViewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDetail() {
      try {
        const [postResponse, meResponse] = await Promise.all([
          fetch(`/api/posts/${postId}`, {
            cache: "no-store",
          }),
          fetch("/api/me", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const postResult =
          (await postResponse.json()) as CommunityPostResponse;

        if (!postResponse.ok || !postResult.ok || !postResult.post) {
          throw new Error(
            postResult.message ?? "글을 불러오지 못했어요.",
          );
        }

        let currentViewer: CommunityViewer | null = null;

        if (meResponse.ok) {
          const meResult = (await meResponse.json()) as MeResponse;
          currentViewer = meResult.authenticated
            ? meResult.user
            : null;
        }

        if (isActive) {
          setPost(postResult.post);
          setViewer(currentViewer);
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error
              ? error.message
              : "글을 불러오지 못했어요.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      isActive = false;
    };
  }, [postId]);

  async function deletePost() {
    if (!post) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "글을 삭제하지 못했어요.");
      }

      setIsDeleteConfirmOpen(false);
      setSuccessMessage("삭제되었숭");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "글을 삭제하지 못했어요.",
      );
      setIsDeleteConfirmOpen(false);
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">🌰</span>
        <p>이야기를 펼치고 있어요...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">🍂</span>
        <h1>이야기를 찾을 수 없어요</h1>
        <p>{message}</p>
        <Link href="/community" className={styles.secondaryButton}>
          광장으로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = String(viewer?.id) === post.authorId;
  const canDelete = isAuthor || viewer?.role === "admin";
  const canEdit =
    isAuthor || (viewer?.role === "admin" && post.isNotice);

  function moveToCommunity() {
    window.location.assign("/community");
  }

  return (
    <>
      <article className={styles.article}>
      <header className={styles.articleHeader}>
        <div className={styles.articleTitleRow}>
          <CommunityAvatar
            profileImage={post.authorProfileImage}
            nickname={post.authorNickname}
            size="large"
          />
          <div className={styles.articleTitleCopy}>
            {post.isNotice && (
              <span className={styles.noticeBadge}>공지</span>
            )}
            <h1>{post.title}</h1>
            <div className={styles.articleMeta}>
              <span>{post.authorNickname}</span>
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
              {post.createdAt !== post.updatedAt && (
                <span>수정됨</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.articleContent}>{post.content}</div>

      {message && (
        <p className={styles.message} role="alert">
          {message}
        </p>
      )}

      <div className={styles.articleActions}>
        <Link href="/community" className={styles.secondaryButton}>
          목록
        </Link>
        {canEdit && (
          <Link
            href={`/community/${post.id}/edit`}
            className={styles.secondaryButton}
          >
            수정
          </Link>
        )}
        {canDelete && (
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>
      </article>

      <CommunityConfirmModal
        isOpen={isDeleteConfirmOpen}
        isProcessing={isDeleting}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={deletePost}
      />

      <CommunitySuccessModal
        isOpen={Boolean(successMessage)}
        message={successMessage}
        onComplete={moveToCommunity}
      />
    </>
  );
}
