"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./UserMenu.module.css";

type UserMenuProps = {
  name: string;
  avatarUrl?: string;
  onLogout: () => void | Promise<void>;
};

const defaultAvatarUrl = "/utang-profile.png";

export function UserMenu({
  name,
  avatarUrl,
  onLogout,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    avatarUrl?.trim() || defaultAvatarUrl,
  );

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageSrc(avatarUrl?.trim() || defaultAvatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await onLogout();
      setIsOpen(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleImageError() {
    if (imageSrc !== defaultAvatarUrl) {
      setImageSrc(defaultAvatarUrl);
    }
  }

  return (
    <div
      className={styles.wrapper}
      ref={menuRef}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`${name} 사용자 메뉴`}
      >
        <img
          src={imageSrc}
          alt=""
          width={38}
          height={38}
          className={styles.avatar}
          onError={handleImageError}
        />

        <span className={styles.userName}>
          {name}
        </span>

        <span
          className={`${styles.arrow} ${
            isOpen ? styles.arrowOpen : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className={styles.dropdown}
          role="menu"
        >
          <div className={styles.greeting}>
            <strong>{name}</strong>
            <span>우땅랜드 주민</span>
          </div>

          <div className={styles.divider} />

          <Link
            href="/profile"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">🪪</span>
            우땅 주민증
          </Link>

          <Link
            href="/gallery"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">🎨</span>
            내 작업실
          </Link>

          <div className={styles.divider} />

          <button
            type="button"
            className={`${styles.menuItem} ${styles.logout}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
            role="menuitem"
          >
            <span aria-hidden="true">🐾</span>

            {isLoggingOut
              ? "산책 준비 중..."
              : "산책 다녀오기"}
          </button>
        </div>
      )}
    </div>
  );
}