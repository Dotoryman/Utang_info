"use client";

import { useEffect, useState } from "react";

import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import { UserMenu } from "./UserMenu";
import type { AuthUser, MeResponse } from "./authTypes";

type AuthModal = "login" | "register" | null;

export function AuthMenu() {
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!isActive) {
          return;
        }

        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error();
        }

        const data = (await response.json()) as MeResponse;
        setUser(data.authenticated ? data.user : null);
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsCheckingAuth(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      alert("로그아웃에 실패했습니다.");
      return;
    }

    setUser(null);
    setRegisteredEmail("");
  }

  function handleLoginSuccess(loginUser: AuthUser) {
    setUser(loginUser);
    setAuthModal(null);
  }

  function handleRegisterSuccess(email: string) {
    setRegisteredEmail(email);
    setAuthModal("login");
  }

  if (isCheckingAuth) {
    return null;
  }

  return (
    <>
      {user ? (
        <UserMenu
          name={user.nickname}
          avatarUrl={user.profileImage}
          role={user.role}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <button
            type="button"
            className="nav-auth-button"
            onClick={() => setAuthModal("register")}
          >
            주민등록
          </button>

          <button
            type="button"
            className="nav-auth-button"
            onClick={() => setAuthModal("login")}
          >
            입장하기
          </button>
        </>
      )}

      <LoginModal
        isOpen={authModal === "login"}
        onClose={() => setAuthModal(null)}
        onOpenRegister={() => setAuthModal("register")}
        onLoginSuccess={handleLoginSuccess}
        initialEmail={registeredEmail}
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={() => setAuthModal(null)}
        onOpenLogin={() => setAuthModal("login")}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
}
