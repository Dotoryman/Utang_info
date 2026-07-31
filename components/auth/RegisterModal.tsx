"use client";

import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./RegisterModal.module.css";
import { TurnstileWidget } from "./TurnstileWidget";

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onRegisterSuccess: (email: string) => void;
};

type RegisterResponse = {
  ok: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    nickname: string;
  };
};

export function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
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
    if (!isOpen) {
      return;
    }

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
  }, [isOpen, isSubmitting, onClose]);

  function resetForm() {
    setEmail("");
    setNickname("");
    setPassword("");
    setPasswordConfirm("");
    setMessage("");
    setTurnstileToken(null);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function handleOverlayClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleMoveToLogin() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onOpenLogin();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNickname = nickname.trim();

    setMessage("");

    if (!normalizedEmail) {
      setMessage("이메일을 입력해 주세요.");
      return;
    }

    if (
      normalizedNickname.length < 2 ||
      normalizedNickname.length > 20
    ) {
      setMessage("닉네임은 2자 이상 20자 이하로 입력해 주세요.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          nickname: normalizedNickname,
          password,
          turnstileToken,
        }),
      });

      const result = (await response.json()) as RegisterResponse;

      if (!response.ok || !result.ok) {
        setMessage(
          result.message ??
            "회원가입 처리 중 문제가 발생했습니다.",
        );
        return;
      }

      resetForm();
      onRegisterSuccess(normalizedEmail);
    } catch {
      setMessage(
        "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
      setSecurityAttempt((current) => current + 1);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="회원가입 창 닫기"
          disabled={isSubmitting}
        >
          ×
        </button>

        <div className={styles.mascot}>
          <img
            src="/utang-profile.png"
            alt=""
            width={88}
            height={88}
          />
        </div>

        <header className={styles.header}>
          <span className={styles.eyebrow}>
            UTANGLAND RESIDENT REGISTRATION
          </span>

          <h2 id="register-modal-title">
            우땅 주민 되기
          </h2>

          <p>
            우땅랜드에서 사용할
            <br />
            주민 정보를 등록해 주세요.
          </p>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span>이메일</span>

            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="utang@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className={styles.field}>
            <span>닉네임</span>

            <input
              type="text"
              value={nickname}
              onChange={(event) =>
                setNickname(event.target.value)
              }
              placeholder="2자 이상 20자 이하"
              autoComplete="nickname"
              minLength={2}
              maxLength={20}
              disabled={isSubmitting}
              required
            />

            <small className={styles.fieldHint}>
              다른 주민과 같은 닉네임도 사용할 수 있어요.
            </small>
          </label>

          <label className={styles.field}>
            <span>비밀번호</span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="8자 이상 입력해 주세요"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              disabled={isSubmitting}
              required
            />
          </label>

          <label className={styles.field}>
            <span>비밀번호 확인</span>

            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) =>
                setPasswordConfirm(event.target.value)
              }
              placeholder="비밀번호를 다시 입력해 주세요"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              disabled={isSubmitting}
              required
            />
          </label>

          {message && (
            <p className={styles.error} role="alert">
              {message}
            </p>
          )}

          <TurnstileWidget
            key={`register-security-${securityAttempt}`}
            action="register"
            onReadyChange={handleSecurityReady}
            onTokenChange={handleTurnstileToken}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !isSecurityReady}
          >
            {!isSecurityReady
              ? "안전한 등록 준비 중..."
              : isSubmitting
                ? "주민등록 중..."
                : "우땅 주민 되기"}
          </button>
        </form>

        <div className={styles.loginArea}>
          <span>이미 우땅 주민인가요?</span>

          <button
            type="button"
            onClick={handleMoveToLogin}
            disabled={isSubmitting}
          >
            입장하기
          </button>
        </div>
      </section>
    </div>
  );
}
