import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  showSlogan?: boolean;
};

export function Logo({
  showSlogan = true,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={styles.logo}
      aria-label="우땅랜드 홈"
    >
      <div className={styles.mark}>
        <Image
          src="/images/utang-face.png"
          alt="우땅"
          width={52}
          height={52}
          priority
        />
      </div>

      <div className={styles.text}>
        <span className={styles.name}>
          UTANG
          <span className={styles.land}>LAND</span>
        </span>

        {showSlogan && (
          <span className={styles.slogan}>
            오늘도 우땅이와 함께
          </span>
        )}
      </div>
    </Link>
  );
}