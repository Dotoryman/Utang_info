"use client";

import Link from "next/link";
import { useEffect } from "react";

import styles from "@/components/site/StatusPage.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled Utangland page error:", error);
  }, [error]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          🙈
        </span>
        <p className={styles.eyebrow}>SOMETHING WENT WRONG</p>
        <h1>우땅이가 잠깐 넘어졌어요</h1>
        <p className={styles.description}>
          페이지를 불러오는 중 문제가 생겼어요.
          <br />
          다시 시도하거나 우땅랜드로 돌아가 주세요.
        </p>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={reset}>
            다시 시도하기
          </button>
          <Link className={styles.secondary} href="/">
            우땅랜드로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
