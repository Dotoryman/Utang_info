"use client";

import { useEffect, useState } from "react";

import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import { AuthStatusModal } from "./AuthStatusModal";
import { UserMenu } from "./UserMenu";
import type { AuthUser, MeResponse } from "./authTypes";

type AuthModal = "login" | "register" | null;

export function AuthMenu() {
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasLogoutError, setHasLogoutError] = useState(false);

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
        const nextUser = data.authenticated ? data.user : null;
        setUser(nextUser);

        if (nextUser) {
          try {
            const notificationResponse = await fetch(
              "/api/notifications?page=1",
              {
                credentials: "include",
                cache: "no-store",
              },
            );
            const notificationData = (await notificationResponse.json()) as {
              unreadCount?: number;
            };
            setUnreadCount(notificationData.unreadCount ?? 0);
          } catch {
            setUnreadCount(0);
          }
        } else {
          setUnreadCount(0);
        }
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
      setHasLogoutError(true);
      return;
    }

    setUser(null);
    setUnreadCount(0);
    setRegisteredEmail("");
  }

  function handleLoginSuccess(loginUser: AuthUser) {
    setUser(loginUser);
    setAuthModal(null);
    void fetch("/api/notifications?page=1", {
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data: { unreadCount?: number }) => {
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {
        setUnreadCount(0);
      });
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
          unreadCount={unreadCount}
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

      <AuthStatusModal
        isOpen={hasLogoutError}
        onClose={() => setHasLogoutError(false)}
      />
    </>
  );
}
