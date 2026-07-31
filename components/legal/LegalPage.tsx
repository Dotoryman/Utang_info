import Link from "next/link";
import type { ReactNode } from "react";

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
          <Link className={styles.brand} href="/" aria-label="우땅랜드 홈">
            <span className={styles.brandMark} aria-hidden="true">
              ●ᴥ●
            </span>
            <span>UTANGLAND</span>
          </Link>
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
