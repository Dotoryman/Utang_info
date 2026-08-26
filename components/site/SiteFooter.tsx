import Link from "next/link";

import styles from "./SiteFooter.module.css";

const instagramUrl =
  "https://www.instagram.com/utang.co?igsh=aWlqMWl5NTVsZG1m";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.mainRow}>
        <Link className={styles.brand} href="/" aria-label="우땅랜드 홈">
          <img src="/images/utang-sun.png" alt="" aria-hidden="true" />
          <span>UTANGLAND</span>
        </Link>

        <p className={styles.tagline}>엉뚱하고 솔직하고 다정한 친구, 우땅이 🐵</p>

        <nav className={styles.links} aria-label="서비스 안내">
          <Link href="/privacy">개인정보 처리방침</Link>
          <Link href="/terms">이용약관</Link>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
        </nav>
      </div>

      <div className={styles.notice}>
        <p>© 소콘소콘. 우땅이 캐릭터 및 관련 저작권은 원작자 소콘소콘에게 있습니다.</p>
        <p>우땅랜드는 팬이 만든 비영리 팬페이지이며 상업적 목적이 없습니다.</p>
      </div>
    </footer>
  );
}
