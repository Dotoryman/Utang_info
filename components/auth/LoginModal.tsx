"use client";

import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./LoginModal.module.css";
import type { AuthUser, LoginResponse } from "./authTypes";
import { TurnstileWidget } from "./TurnstileWidget";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onLoginSuccess: (user: AuthUser) => void | Promise<void>;
  initialEmail?: string;
};

export function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onLoginSuccess,
  initialEmail = "",
}: LoginModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <LoginModalContent
      initialEmail={initialEmail}
      onClose={onClose}
      onOpenRegister={onOpenRegister}
      onLoginSuccess={onLoginSuccess}
    />
  );
}

type LoginModalContentProps = Omit<LoginModalProps, "isOpen">;

function LoginModalContent({
  onClose,
  onOpenRegister,
  onLoginSuccess,
  initialEmail = "",
}: LoginModalContentProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSecurityReady, setIsSecurityReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [securityAttempt, setSecurityAttempt] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const handleSecurityReady = useCallback((ready: boolean) => {
    setIsSecurityReady(ready);
  }, []);
  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSubmitting, onClose]);

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setPassword("");
    setTurnstileToken(null);
    onClose();
  }

  function handleOverlayClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleMoveToRegister() {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setPassword("");
    setTurnstileToken(null);
    onOpenRegister();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          turnstileToken,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.ok || !result.user) {
        setMessage(
          result.message ?? "이메일 또는 비밀번호를 확인해 주세요.",
        );
        return;
      }

      setPassword("");
      await onLoginSuccess(result.user);
    } catch {
      setMessage(
        "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
      setSecurityAttempt((current) => current + 1);
    }
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className={styles.mobileHandle}
          aria-hidden="true"
        />

        <button
          type="button"
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="로그인 창 닫기"
          disabled={isSubmitting}
        >
          ×
        </button>

        <div className={styles.heading}>
          <div className={styles.characterMark}>
            <img
              src="/utang-profile.png"
              alt=""
              width={88}
              height={88}
            />
          </div>

          <p className={styles.eyebrow}>
            WELCOME TO UTANGLAND
          </p>

          <h2 id="login-modal-title">
            우땅랜드에
            <br />
            놀러 왔구나!
          </h2>

          <p>
            오늘도 우땅이와 함께
            <br />
            신나게 우다다 놀아볼까?
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span>이메일</span>

            <input
              ref={emailInputRef}
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="utang@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className={styles.field}>
            <span>비밀번호</span>

            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </label>

          {message && (
            <p className={styles.message} role="alert">
              {message}
            </p>
          )}

          <TurnstileWidget
            key={`login-security-${securityAttempt}`}
            action="login"
            onReadyChange={handleSecurityReady}
            onTokenChange={handleTurnstileToken}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !isSecurityReady}
          >
            {!isSecurityReady
              ? "안전한 입장 준비 중..."
              : isSubmitting
                ? "입장하는 중..."
                : "우땅랜드 입장하기"}
          </button>
        </form>

        <div className={styles.registerArea}>
          <span>아직 우땅랜드 친구가 아니야?</span>

          <button
            type="button"
            className={styles.registerLink}
            onClick={handleMoveToRegister}
            disabled={isSubmitting}
          >
            우땅랜드 주민 되기
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </section>
    </div>
  );
}
