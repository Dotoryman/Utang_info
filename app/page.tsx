import type { Metadata } from "next";

import styles from "./Closure.module.css";

const instagramUrl =
  "https://www.instagram.com/utang.co?igsh=aWlqMWl5NTVsZG1m";

export const metadata: Metadata = {
  title: "우땅랜드 운영 안내",
  description:
    "우땅랜드는 우땅이 공식 홈페이지가 아닙니다. 우땅이 공식 인스타그램을 확인해 주세요.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="closure-title">
        <img
          className={styles.character}
          src="/closure-utang.png"
          alt="부시시한 머리로 노란 이불을 덮고 있는 우땅이"
        />

        <p className={styles.eyebrow}>UTANGLAND NOTICE</p>
        <h1 id="closure-title">우땅랜드 안내</h1>

        <div className={styles.notice}>
          <p>해당 페이지는 공식 우땅이 홈페이지가 아닙니다.</p>
          <p>우땅이 공식 인스타그램으로 이동합니다.</p>
        </div>

        <a
          className={styles.instagramButton}
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
        >
          우땅이 공식 Instagram으로 이동
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
