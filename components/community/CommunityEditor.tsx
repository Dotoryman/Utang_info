"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import type { AuthUser, MeResponse } from "../auth/authTypes";
import { CommunitySuccessModal } from "./CommunitySuccessModal";
import styles from "./Community.module.css";
import type {
  CommunityMutationResponse,
  CommunityPostResponse,
} from "./communityTypes";

type CommunityEditorProps = {
  postId?: string;
};

const TITLE_MAX_LENGTH = 80;
const CONTENT_MAX_LENGTH = 5_000;

export function CommunityEditor({
  postId,
}: CommunityEditorProps) {
  const [viewer, setViewer] = useState<AuthUser | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fatalMessage, setFatalMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function prepareEditor() {
      try {
        const meResponse = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!meResponse.ok) {
          if (isActive) {
            setViewer(null);
          }
          return;
        }

        const meResult = (await meResponse.json()) as MeResponse;

        if (!meResult.authenticated || !meResult.user) {
          if (isActive) {
            setViewer(null);
          }
          return;
        }

        if (isActive) {
          setViewer(meResult.user);
        }

        if (!postId) {
          return;
        }

        const postResponse = await fetch(`/api/posts/${postId}`, {
          cache: "no-store",
        });
        const postResult =
          (await postResponse.json()) as CommunityPostResponse;

        if (!postResponse.ok || !postResult.post) {
          throw new Error(
            postResult.message ?? "수정할 글을 찾지 못했어요.",
          );
        }

        const canEdit =
          String(meResult.user.id) === postResult.post.authorId ||
          (meResult.user.role === "admin" &&
            postResult.post.isNotice);

        if (!canEdit) {
          throw new Error("이 글을 수정할 권한이 없어요.");
        }

        if (isActive) {
          setTitle(postResult.post.title);
          setContent(postResult.post.content);
          setIsNotice(postResult.post.isNotice);
        }
      } catch (error) {
        if (isActive) {
          setFatalMessage(
            error instanceof Error
              ? error.message
              : "글쓰기 화면을 준비하지 못했어요.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void prepareEditor();

    return () => {
      isActive = false;
    };
  }, [postId]);

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        postId ? `/api/posts/${postId}` : "/api/posts",
        {
          method: postId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            content,
            isNotice,
          }),
        },
      );
      const result =
        (await response.json()) as CommunityMutationResponse;

      if (!response.ok || !result.ok || !result.post) {
        throw new Error(result.message ?? "글을 저장하지 못했어요.");
      }

      setSuccessMessage(postId ? "수정되었숭" : "등록되었숭");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "글을 저장하지 못했어요.",
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">✏️</span>
        <p>도토리 연필을 준비하고 있어요...</p>
      </div>
    );
  }

  if (!viewer || fatalMessage) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">{viewer ? "🥺" : "🔐"}</span>
        <h1>
          {fatalMessage
            ? "글쓰기 화면을 열지 못했어요"
            : "입장이 필요해요"}
        </h1>
        <p>
          {fatalMessage ||
            "우땅랜드 홈에서 입장한 뒤 광장에 이야기를 남겨주세요."}
        </p>
        <Link
          href={fatalMessage ? "/community" : "/"}
          className={styles.secondaryButton}
        >
          {fatalMessage
            ? "광장으로 돌아가기"
            : "우땅랜드로 돌아가기"}
        </Link>
      </div>
    );
  }

  function moveToCommunity() {
    window.location.assign("/community");
  }

  return (
    <>
      <form className={styles.editor} onSubmit={submitPost}>
      <label className={styles.field}>
        <span>제목</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={2}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="광장에 남길 이야기 제목"
          disabled={isSubmitting}
          required
        />
        <small className={styles.fieldFooter}>
          {title.length}/{TITLE_MAX_LENGTH}
        </small>
      </label>

      <label className={styles.field}>
        <span>이야기</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={CONTENT_MAX_LENGTH}
          placeholder="우땅랜드 주민들과 나누고 싶은 이야기를 적어주세요."
          disabled={isSubmitting}
          required
        />
        <small className={styles.fieldFooter}>
          {content.length.toLocaleString()}/
          {CONTENT_MAX_LENGTH.toLocaleString()}
        </small>
      </label>

      {viewer.role === "admin" && (
        <label className={styles.noticeToggle}>
          <input
            type="checkbox"
            checked={isNotice}
            onChange={(event) => setIsNotice(event.target.checked)}
            disabled={isSubmitting}
          />
          광장 상단에 공지글로 올리기
        </label>
      )}

      {formMessage && (
        <p className={styles.message} role="alert">
          {formMessage}
        </p>
      )}

      <div className={styles.editorActions}>
        <Link
          href={postId ? `/community/${postId}` : "/community"}
          className={styles.secondaryButton}
        >
          취소
        </Link>
        <button
          type="submit"
          className={styles.writeButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "저장하는 중..."
            : postId
              ? "수정 완료"
              : "이야기 올리기"}
        </button>
      </div>
      </form>

      <CommunitySuccessModal
        isOpen={Boolean(successMessage)}
        message={successMessage}
        onComplete={moveToCommunity}
      />
    </>
  );
}
