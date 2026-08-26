import Link from "next/link";

import styles from "./SiteBrand.module.css";

type SiteBrandProps = {
  href?: string;
  label?: string;
  compact?: boolean;
};

export function SiteBrand({
  href = "/",
  label = "우땅랜드 홈",
  compact = false,
}: SiteBrandProps) {
  return (
    <Link
      href={href}
      className={`${styles.brand} ${compact ? styles.compact : ""}`}
      aria-label={label}
    >
      <span className={styles.sun} aria-hidden="true">
        <img src="/images/utang-sun.png" alt="" />
      </span>
      <span className={styles.copy}>
        <strong>UTANGLAND</strong>
        <small>우땅이 팬페이지</small>
      </span>
    </Link>
  );
}
