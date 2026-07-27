"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { LoginModal } from "../auth/LoginModal";
import { RegisterModal } from "../auth/RegisterModal";
import { UserMenu } from "../auth/UserMenu";
import { Logo } from "../utang/Logo";



type AuthModal = "login" | "register" | null;

type User = {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

type MeResponse = {
  authenticated: boolean;
  user: User | null;
};

type HeaderProps = {
  instagramUrl: string;
};

export function Header(
  {instagramUrl}: HeaderProps
) {
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error("로그인 상태를 확인하지 못했습니다.");
      }

      const data = (await response.json()) as MeResponse;

      setUser(
        data.authenticated && data.user
          ? data.user
          : null,
      );
    } catch (error) {
      console.error("로그인 상태 확인 실패:", error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  function openLoginModal() {
    setAuthModal("login");
  }

  function openRegisterModal() {
    setAuthModal("register");
  }

  function closeAuthModal() {
    setAuthModal(null);
  }

  function handleRegisterSuccess(email: string) {
    setRegisteredEmail(email);
    setAuthModal("login");
  }

  function handleLoginSuccess(loginUser: User) {
    setUser(loginUser);
    setAuthModal(null);
  }

  async function handleLogout() {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("로그아웃하지 못했습니다.");
    }

    setUser(null);
    setRegisteredEmail("");
  }

  return (
    <>
      <header className="site-header">
        <div className="site-container header-inner">
          <Logo />

          <nav className="header-nav" aria-label="주요 메뉴">
            <Link href="/" className="header-link">
              홈
            </Link>

            {/* 인증 확인이 끝난 뒤 메뉴 표시 */}
            {!isCheckingAuth && (
              <>
                {user ? (
                  <UserMenu
                    name={user.nickname}
                    avatarUrl={
                      user.profileImage?.trim() ||
                      "/utang-profile.png"
                    }
                    onLogout={handleLogout}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      className="header-link"
                      onClick={openRegisterModal}
                    >
                      주민등록
                    </button>

                    <button
                      type="button"
                      className="header-link header-link-emphasis"
                      onClick={openLoginModal}
                    >
                      입장하기
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <LoginModal
        isOpen={authModal === "login"}
        onClose={closeAuthModal}
        onOpenRegister={openRegisterModal}
        onLoginSuccess={handleLoginSuccess}
        initialEmail={registeredEmail}
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={closeAuthModal}
        onOpenLogin={openLoginModal}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
}