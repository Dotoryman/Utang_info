import Link from "next/link";
import type { ReactNode } from "react";

import { SiteBrand } from "@/components/site/SiteBrand";
import styles from "./LegalPage.module.css";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: LegalPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <SiteBrand compact />
          <Link className={styles.homeLink} href="/">
            ← 우땅랜드로
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <span className={styles.updated}>시행일 2026. 07. 31.</span>
        </section>

        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
