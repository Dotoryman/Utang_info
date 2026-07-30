import type { RefObject } from "react";

import styles from "./Fortune.module.css";

type FortuneButtonProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
};

export function FortuneButton({ buttonRef, onClick }: FortuneButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.button}
      onClick={onClick}
      aria-haspopup="dialog"
    >
      <span className={styles.acorn} aria-hidden="true">
        🌰
      </span>
      <span className={styles.label}>우땅점술소</span>
      <span className={styles.star} aria-hidden="true">
        ✨
      </span>
    </button>
  );
}
