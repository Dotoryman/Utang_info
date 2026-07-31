"use client";

import { useEffect, useRef } from "react";

import styles from "@/app/profile/Profile.module.css";

type ProfileStatusModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  onClose: () => void;
};

export function ProfileStatusModal({
  isOpen,
  title,
  message,
  icon,
  actionLabel = "확인했숭",
  onClose,
}: ProfileStatusModalProps) {
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    actionRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.statusModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-status-title"
      >
        <span className={styles.modalIcon} aria-hidden="true">
          {icon}
        </span>
        <h2 id="profile-status-title">{title}</h2>
        <p>{message}</p>
        <button
          ref={actionRef}
          type="button"
          className={styles.modalButton}
          onClick={onClose}
        >
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
