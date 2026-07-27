"use client";

import { useCallback, useEffect, useState } from "react";

import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import { UserMenu } from "./UserMenu";

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

type AuthModal = "login" | "register" | null;

export function AuthMenu() {
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [user, setUser] = useState<User | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

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
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

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

  function handleLoginSuccess(loginUser: User) {
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