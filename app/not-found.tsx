import Link from "next/link";

import styles from "@/components/site/StatusPage.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          🌰
        </span>
        <p className={styles.eyebrow}>404 · LOST ACORN</p>
        <h1>길을 잃은 도토리예요</h1>
        <p className={styles.description}>
          찾으려는 페이지가 없거나 다른 곳으로 이동했어요.
          <br />
          우땅이가 아는 길로 함께 돌아가요.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            우땅랜드로 돌아가기
          </Link>
          <Link className={styles.secondary} href="/community">
            우땅 광장 가기
          </Link>
        </div>
      </section>
    </main>
  );
}
