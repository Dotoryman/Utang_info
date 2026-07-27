"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Profile.module.css";

type User = {
  id: number | string;
  email: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

type MeResponse = {
  authenticated: boolean;
  user: User | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        /*
         * /api/me는 로그아웃 상태에서 401을 반환한다.
         * 이것은 서버 오류가 아니라 정상적인 비로그인 상태다.
         */
        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error("사용자 정보를 불러오지 못했습니다.");
        }

        const data = (await response.json()) as MeResponse;

        if (!data.authenticated || !data.user) {
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.messageCard}>
          <span className={styles.loadingIcon} aria-hidden="true">
            🌰
          </span>

          <p>주민증을 찾고 있어요...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className={styles.page}>
        <div className={styles.messageCard}>
          <span className={styles.largeIcon} aria-hidden="true">
            🥺
          </span>

          <h1>주민증을 불러오지 못했어요</h1>

          <p>{errorMessage}</p>

          <Link href="/" className={styles.homeLink}>
            우땅랜드로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.messageCard}>
          <span className={styles.largeIcon} aria-hidden="true">
            🐾
          </span>

          <h1>입장이 필요한 곳이에요</h1>

          <p>우땅 주민증은 로그인한 주민만 확인할 수 있어요.</p>

          <Link href="/" className={styles.homeLink}>
            우땅랜드 입구로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const residentNumber = String(user.id)
  .replaceAll("-", "")
  .slice(0, 8)
  .toUpperCase();

  const profileImage =
    user.profileImage?.trim() || "/utang-profile.png";

  const roleLabel =
    user.role === "admin" ? "우땅랜드 관리소장" : "우땅랜드 주민";
  return (
    <main className={styles.page}>
      <section className={styles.profileSection}>
        <div className={styles.titleArea}>
          <span className={styles.eyebrow}>
            UTANGLAND RESIDENT CARD
          </span>

          <h1>우땅 주민증</h1>

          <p>오늘도 우땅이와 함께하는 소중한 주민이에요.</p>
        </div>

        <article className={styles.residentCard}>
          <div
            className={styles.cardDecoration}
            aria-hidden="true"
          >
            🌰
          </div>

          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardLabel}>
                UTANGLAND
              </span>

              <h2>우땅 주민증</h2>
            </div>

            <span className={styles.levelBadge}>
              우다다 Lv.1
            </span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.avatarFrame}>
              <img
                src={profileImage}
                alt={`${user.nickname}님의 프로필`}
                width={150}
                height={150}
                className={styles.avatar}
/>
            </div>

            <dl className={styles.information}>
              <div className={styles.informationRow}>
                <dt>주민 이름</dt>
                <dd>{user.nickname}</dd>
              </div>

              <div className={styles.informationRow}>
                <dt>주민 번호</dt>
                <dd>UTANG-{residentNumber}</dd>
              </div>

              <div className={styles.informationRow}>
                <dt>주민 등급</dt>
                <dd>{roleLabel}</dd>
              </div>

              <div className={styles.informationRow}>
                <dt>이메일</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.cardFooter}>
            <span>오늘도 우땅이와 함께</span>
            <strong>UTANGLAND</strong>
          </div>
        </article>

        <div className={styles.stats}>
          <article>
            <strong>0</strong>
            <span>작업실 작품</span>
          </article>

          <article>
            <strong>0</strong>
            <span>광장 이야기</span>
          </article>

          <article>
            <strong>0</strong>
            <span>받은 좋아요</span>
          </article>
        </div>

        <Link href="/" className={styles.backLink}>
          ← 우땅랜드로 돌아가기
        </Link>
      </section>
    </main>
  );
}