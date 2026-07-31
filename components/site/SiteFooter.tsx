import Link from "next/link";

import styles from "./SiteFooter.module.css";

const instagramUrl =
  "https://www.instagram.com/utang.co?igsh=aWlqMWl5NTVsZG1m";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/" aria-label="우땅랜드 홈">
        <span className={styles.brandMark} aria-hidden="true">
          ●ᴥ●
        </span>
        <span>UTANG</span>
      </Link>

      <p className={styles.tagline}>
        작고 엉뚱하고 다정한 친구, 우땅이
      </p>

      <nav className={styles.links} aria-label="서비스 안내">
        <Link href="/privacy">개인정보 처리방침</Link>
        <Link href="/terms">이용약관</Link>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          Instagram ↗
        </a>
      </nav>
    </footer>
  );
}
