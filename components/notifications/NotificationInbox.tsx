"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CommunityConfirmModal } from "../community/CommunityConfirmModal";
import styles from "./NotificationInbox.module.css";
import type {
  NotificationItem,
  NotificationResponse,
} from "./notificationTypes";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationInbox() {
  const [data, setData] = useState<NotificationResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadNotifications() {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/notifications?page=${page}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const result =
          (await response.json()) as NotificationResponse;

        if (isActive) {
          setData({
            ...result,
            message:
              result.message ??
              (!response.ok
                ? "알림을 불러오지 못했어요."
                : undefined),
          });
        }
      } catch {
        if (isActive) {
          setData({
            ok: false,
            message: "알림을 불러오지 못했어요.",
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isActive = false;
    };
  }, [page, reloadVersion]);

  async function markRead(id: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      return;
    }

    setData((current) =>
      current
        ? {
            ...current,
            unreadCount: Math.max(0, (current.unreadCount ?? 0) - 1),
            notifications: current.notifications?.map((item) =>
              item.id === id ? { ...item, isRead: true } : item,
            ),
          }
        : current,
    );
  }

  async function markAllRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (!response.ok) {
      return;
    }

    setData((current) =>
      current
        ? {
            ...current,
            unreadCount: 0,
            notifications: current.notifications?.map((item) => ({
              ...item,
              isRead: true,
            })),
          }
        : current,
    );
  }

  async function cleanupReadNotifications() {
    if (isCleaning) {
      return;
    }

    setIsCleaning(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      setIsCleanupOpen(false);
      setPage(1);
      setReloadVersion((current) => current + 1);
    } finally {
      setIsCleaning(false);
    }
  }

  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>UTANGLAND MAILBOX</p>
            <h1>우땅 우편함</h1>
            <p>내 이야기에 도착한 작은 소식을 모아봤숭.</p>
          </div>
          <Link href="/" className={styles.homeLink}>
            ← 우땅랜드로
          </Link>
        </header>

        <section className={styles.inbox} aria-label="알림 목록">
          <div className={styles.inboxHeader}>
            <h2>새로운 소식</h2>
            <div className={styles.inboxActions}>
              {data?.ok &&
                (data.pagination?.totalItems ?? 0) >
                  (data.unreadCount ?? 0) && (
                  <button
                    type="button"
                    className={styles.cleanupButton}
                    onClick={() => setIsCleanupOpen(true)}
                  >
                    읽은 소식 정리
                  </button>
                )}
              {data?.ok && (data.unreadCount ?? 0) > 0 ? (
                <button
                  type="button"
                  className={styles.readAllButton}
                  onClick={() => void markAllRead()}
                >
                  모두 읽었숭
                </button>
              ) : (
                <span className={styles.countBadge}>
                  {data?.unreadCount ?? 0}개
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className={styles.state}>
              <span aria-hidden="true">📮</span>
              <p>우편함을 열고 있어요...</p>
            </div>
          ) : !data?.ok ? (
            <div className={styles.state}>
              <span aria-hidden="true">🥺</span>
              <p>{data?.message ?? "알림을 불러오지 못했어요."}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <span aria-hidden="true">🌰</span>
              <p>아직 도착한 소식이 없어요.</p>
            </div>
          ) : (
            <ol className={styles.list}>
              {notifications.map((notification: NotificationItem) => (
                <li
                  key={notification.id}
                  className={
                    notification.isRead ? styles.item : styles.itemUnread
                  }
                >
                  <Link
                    href={`/community/${notification.postId}`}
                    className={styles.itemLink}
                    onClick={() => {
                      if (!notification.isRead) {
                        void markRead(notification.id);
                      }
                    }}
                  >
                    <span className={styles.itemIcon} aria-hidden="true">
                      {notification.type === "comment" ? "💬" : "❤️"}
                    </span>
                    <span className={styles.itemContent}>
                      <strong>{notification.message}</strong>
                      <time dateTime={notification.createdAt}>
                        {formatDate(notification.createdAt)}
                      </time>
                    </span>
                    {!notification.isRead && (
                      <span
                        className={styles.unreadDot}
                        aria-label="읽지 않음"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {pagination && pagination.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="알림 페이지">
            {Array.from(
              { length: pagination.totalPages },
              (_, index) => index + 1,
            ).map((nextPage) => (
              <button
                key={nextPage}
                type="button"
                className={`${styles.pageButton} ${
                  nextPage === pagination.page
                    ? styles.pageButtonActive
                    : ""
                }`}
                onClick={() => setPage(nextPage)}
                aria-current={
                  nextPage === pagination.page ? "page" : undefined
                }
              >
                {nextPage}
              </button>
            ))}
          </nav>
        )}

        <CommunityConfirmModal
          isOpen={isCleanupOpen}
          isProcessing={isCleaning}
          eyebrow="CLEAN MAILBOX"
          icon="📮"
          title="읽은 소식을 정리하겠숭?"
          description="이미 읽은 알림만 우편함에서 삭제되며, 읽지 않은 소식은 그대로 남아요."
          confirmLabel="정리하기"
          processingLabel="정리하는 중..."
          onCancel={() => setIsCleanupOpen(false)}
          onConfirm={cleanupReadNotifications}
        />
      </section>
    </main>
  );
}
