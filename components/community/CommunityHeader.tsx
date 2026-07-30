import Link from "next/link";

import styles from "./Community.module.css";

export function CommunityHeader() {
  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.brand}
        aria-label="우땅랜드 홈"
      >
        <span className={styles.brandMark} aria-hidden="true">
          ●ᴥ●
        </span>
        <span>UTANGLAND</span>
      </Link>

      <Link href="/" className={styles.homeLink}>
        ← 우땅랜드로
      </Link>
    </header>
  );
}
