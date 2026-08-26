import Link from "next/link";

import { SiteBrand } from "@/components/site/SiteBrand";

import styles from "./Community.module.css";

export function CommunityHeader() {
  return (
    <header className={styles.header}>
      <SiteBrand compact />

      <Link href="/" className={styles.homeLink}>
        ← 우땅랜드로
      </Link>
    </header>
  );
}
