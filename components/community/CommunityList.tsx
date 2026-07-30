"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./Community.module.css";
import { CommunityAvatar } from "./CommunityAvatar";
import type { CommunityListResponse } from "./communityTypes";

type CommunityListProps = {
  initialPage: number;
};

const emptyPagination = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function CommunityList({
  initialPage,
}: CommunityListProps) {
  const [data, setData] = useState<CommunityListResponse>({
    ok: true,
    posts: [],
    pagination: emptyPagination,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      try {
        const response = await fetch(
          `/api/posts?page=${initialPage}`,
          {
            cache: "no-store",
          },
        );
        const result = (await response.json()) as CommunityListResponse;

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message ?? "광장 이야기를 불러오지 못했어요.",
          );
        }

        if (isActive) {
          setData(result);
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error
              ? error.message
              : "광장 이야기를 불러오지 못했어요.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, [initialPage]);

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">🌰</span>
        <p>광장 이야기를 모으고 있어요...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className={styles.stateCard}>
        <span aria-hidden="true">🥺</span>
        <h2>이야기를 불러오지 못했어요</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          이야기 {data.pagination.totalItems}개
        </span>

        <Link href="/community/write" className={styles.writeButton}>
          이야기 남기기
        </Link>
      </div>

      <section className={styles.board} aria-label="우땅 광장 글 목록">
        {data.posts.length === 0 ? (
          <div className={styles.empty}>
            <span aria-hidden="true">🍂</span>
            <strong>아직 광장이 조용해요.</strong>
            <p>첫 번째 이야기를 남겨주세요!</p>
          </div>
        ) : (
          <ol className={styles.postList}>
            {data.posts.map((post) => (
              <li className={styles.postItem} key={post.id}>
                <Link
                  href={`/community/${post.id}`}
                  className={styles.postLink}
                >
                  <div className={styles.postIdentity}>
                    <CommunityAvatar
                      profileImage={post.authorProfileImage}
                      nickname={post.authorNickname}
                    />
                    <div className={styles.postCopy}>
                      <div className={styles.postTitleRow}>
                        {post.isNotice && (
                          <span className={styles.noticeBadge}>공지</span>
                        )}
                        <span className={styles.postTitle}>
                          {post.title}
                        </span>
                      </div>
                      <div className={styles.postMeta}>
                        <span>{post.authorNickname}</span>
                        {post.createdAt !== post.updatedAt && (
                          <span>수정됨</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <time
                    className={styles.postDate}
                    dateTime={post.createdAt}
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {data.pagination.totalPages > 1 && (
        <nav className={styles.pagination} aria-label="광장 페이지">
          {Array.from(
            { length: data.pagination.totalPages },
            (_, index) => index + 1,
          ).map((page) => (
            <Link
              key={page}
              href={`/community?page=${page}`}
              className={`${styles.pageLink} ${
                page === data.pagination.page
                  ? styles.pageLinkActive
                  : ""
              }`}
              aria-current={
                page === data.pagination.page ? "page" : undefined
              }
            >
              {page}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
