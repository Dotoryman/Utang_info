"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./Admin.module.css";
import type {
  AdminUser,
  AdminUserListResponse,
} from "./adminTypes";

type AdminUserListProps = {
  initialPage: number;
};

const defaultAvatarUrl = "/utang-profile.png";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getResidentNumber(id: string): string {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}

export function AdminUserList({
  initialPage,
}: AdminUserListProps) {
  const [data, setData] = useState<AdminUserListResponse>({
    ok: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      try {
        const response = await fetch(
          `/api/admin/users?page=${initialPage}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const result =
          (await response.json()) as AdminUserListResponse;

        if (!isActive) {
          return;
        }

        setData({
          ...result,
          message:
            result.message ??
            (!response.ok
              ? "회원 목록을 불러오지 못했어요."
              : undefined),
        });
      } catch {
        if (isActive) {
          setData({
            ok: false,
            message: "회원 목록을 불러오지 못했어요.",
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isActive = false;
    };
  }, [initialPage]);

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.loadingIcon} aria-hidden="true">
          🌰
        </span>
        <p>주민 명부를 펼치고 있어요...</p>
      </div>
    );
  }

  if (!data.ok || !data.users || !data.pagination || !data.summary) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.stateIcon} aria-hidden="true">
          {data.message?.includes("관리자") ? "🔐" : "🥺"}
        </span>
        <h2>주민 명부를 열 수 없어요</h2>
        <p>{data.message ?? "잠시 후 다시 시도해 주세요."}</p>
        <Link href="/" className={styles.homeButton}>
          우땅랜드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className={styles.summary} aria-label="회원 현황">
        <article>
          <span>전체 주민</span>
          <strong>{data.summary.totalUsers}</strong>
        </article>
        <article>
          <span>일반 주민</span>
          <strong>{data.summary.totalResidents}</strong>
        </article>
        <article>
          <span>관리소장</span>
          <strong>{data.summary.totalAdmins}</strong>
        </article>
      </section>

      <section className={styles.directory} aria-label="회원 목록">
        <div className={styles.directoryHeader}>
          <div>
            <span>RESIDENT DIRECTORY</span>
            <h2>주민 명부</h2>
          </div>
          <span className={styles.resultCount}>
            {data.pagination.totalItems}명
          </span>
        </div>

        {data.users.length === 0 ? (
          <div className={styles.empty}>
            <span aria-hidden="true">🍂</span>
            <strong>등록된 주민이 없어요.</strong>
          </div>
        ) : (
          <ol className={styles.userList}>
            {data.users.map((user) => (
              <li className={styles.userItem} key={user.id}>
                <UserAvatar user={user} />

                <div className={styles.identity}>
                  <div className={styles.nameRow}>
                    <strong>{user.nickname}</strong>
                    <span
                      className={
                        user.role === "admin"
                          ? styles.adminBadge
                          : styles.residentBadge
                      }
                    >
                      {user.role === "admin" ? "관리소장" : "주민"}
                    </span>
                  </div>
                  <span className={styles.residentNumber}>
                    UTANG-{getResidentNumber(user.id)}
                  </span>
                </div>

                <a
                  href={`mailto:${user.email}`}
                  className={styles.email}
                >
                  {user.email}
                </a>

                <time
                  className={styles.joinedAt}
                  dateTime={user.createdAt}
                >
                  <span>가입일</span>
                  {formatDate(user.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      {data.pagination.totalPages > 1 && (
        <nav className={styles.pagination} aria-label="회원 목록 페이지">
          {Array.from(
            { length: data.pagination.totalPages },
            (_, index) => index + 1,
          ).map((page) => (
            <Link
              key={page}
              href={`/admin/users?page=${page}`}
              className={`${styles.pageLink} ${
                page === data.pagination?.page
                  ? styles.pageLinkActive
                  : ""
              }`}
              aria-current={
                page === data.pagination?.page ? "page" : undefined
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

function UserAvatar({ user }: { user: AdminUser }) {
  const avatarUrl = user.profileImage?.trim() || defaultAvatarUrl;

  return (
    <img
      src={avatarUrl}
      alt=""
      width={54}
      height={54}
      className={styles.avatar}
      onError={(event) => {
        event.currentTarget.src = defaultAvatarUrl;
      }}
    />
  );
}
