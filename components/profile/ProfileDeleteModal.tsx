"use client";

import { useEffect, useRef } from "react";

import styles from "@/app/profile/Profile.module.css";

type ProfileDeleteModalProps = {
  isOpen: boolean;
  isProcessing: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ProfileDeleteModal({
  isOpen,
  isProcessing,
  password,
  onPasswordChange,
  onCancel,
  onConfirm,
}: ProfileDeleteModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isProcessing) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) {
          onCancel();
        }
      }}
    >
      <section
        className={styles.deleteAccountModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="profile-delete-title"
        aria-describedby="profile-delete-description"
      >
        <span className={styles.modalIcon} aria-hidden="true">
          🍂
        </span>
        <p className={styles.deleteEyebrow}>LEAVE UTANGLAND</p>
        <h2 id="profile-delete-title">우땅랜드를 떠나겠숭?</h2>
        <p id="profile-delete-description">
          주민증과 작성한 이야기, 댓글, 좋아요, 알림이 모두 삭제되며
          되돌릴 수 없어요.
        </p>

        <label className={styles.deletePasswordField}>
          <span>현재 비밀번호 확인</span>
          <input
            ref={inputRef}
            type="password"
            value={password}
            maxLength={128}
            autoComplete="current-password"
            disabled={isProcessing}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>

        <div className={styles.deleteModalActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            disabled={isProcessing}
            onClick={onCancel}
          >
            계속 머물기
          </button>
          <button
            type="button"
            className={styles.deleteAccountConfirm}
            disabled={isProcessing || password.length === 0}
            onClick={onConfirm}
          >
            {isProcessing ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
          </button>
        </div>
      </section>
    </div>
  );
}
