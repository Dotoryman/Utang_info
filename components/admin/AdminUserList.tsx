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

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function formatUsagePercent(value: number): string {
  if (value > 0 && value < 0.01) {
    return "<0.01%";
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
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

      <StorageUsageCard storage={data.storage} />

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

function StorageUsageCard({
  storage,
}: {
  storage: AdminUserListResponse["storage"];
}) {
  if (!storage) {
    return (
      <section className={styles.storageCard}>
        <div className={styles.storageHeading}>
          <div>
            <span>R2 STORAGE</span>
            <h2>프로필 이미지 저장공간</h2>
          </div>
          <strong className={styles.storageUnavailable}>확인 불가</strong>
        </div>
        <p className={styles.storageDescription}>
          R2 저장소가 연결되면 사용량이 여기에 표시돼요.
        </p>
      </section>
    );
  }

  const state =
    storage.usagePercent >= 90
      ? "danger"
      : storage.usagePercent >= 70
        ? "warning"
        : "safe";
  const stateLabel =
    state === "danger"
      ? "용량 주의"
      : state === "warning"
        ? "확인 필요"
        : "안전";
  const visiblePercent =
    storage.usedBytes > 0
      ? Math.max(storage.usagePercent, 0.6)
      : 0;

  return (
    <section className={styles.storageCard} aria-label="R2 저장공간 현황">
      <div className={styles.storageHeading}>
        <div>
          <span>R2 STORAGE</span>
          <h2>프로필 이미지 저장공간</h2>
        </div>
        <strong
          className={styles.storageState}
          data-state={state}
        >
          {stateLabel}
        </strong>
      </div>

      <div
        className={styles.storageTrack}
        role="progressbar"
        aria-label="프로필 이미지 저장공간 사용률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(storage.usagePercent.toFixed(2))}
      >
        <span
          className={styles.storageFill}
          data-state={state}
          style={{ width: `${visiblePercent}%` }}
        />
      </div>

      <div className={styles.storageMetrics}>
        <div>
          <span>사용 중</span>
          <strong>{formatBytes(storage.usedBytes)}</strong>
        </div>
        <div>
          <span>안전 한도</span>
          <strong>{formatBytes(storage.limitBytes)}</strong>
        </div>
        <div>
          <span>남은 용량</span>
          <strong>{formatBytes(storage.remainingBytes)}</strong>
        </div>
        <div>
          <span>저장 이미지</span>
          <strong>{storage.objectCount}개</strong>
        </div>
      </div>

      <p className={styles.storageCaption}>
        현재 {formatUsagePercent(storage.usagePercent)} 사용 중 ·
        Cloudflare 무료 저장공간보다 여유 있게 설정한 8GiB 안전
        한도예요.
      </p>
    </section>
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
