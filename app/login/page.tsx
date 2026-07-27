"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./login.module.css";

type LoginResponse = {
  ok: boolean;
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.ok) {
        setMessage(
          result.message ?? "로그인 중 문제가 발생했습니다.",
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            🌰
          </span>

          <span className={styles.logoText}>
            <strong>Utangland</strong>
            <small>오늘도 우땅과 함께</small>
          </span>
        </Link>

        <div className={styles.heading}>
          <h1>입장하기</h1>
          <p>우땅랜드에 다시 온 걸 환영해!</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>이메일</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="utang@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              required
            />
          </label>

          {message && (
            <p className={styles.message} role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "입장하는 중..." : "입장하기"}
          </button>
        </form>

        <p className={styles.registerText}>
          아직 우땅랜드 주민이 아니야?{" "}
          <Link href="/register">우땅 주민 되기</Link>
        </p>
      </section>
    </main>
  );
}