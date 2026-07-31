"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AuthUser,
  MeResponse,
} from "@/components/auth/authTypes";
import {
  PROFILE_IMAGE_MAX_BYTES,
  validateProfileImageMetadata,
} from "@/lib/profile";
import styles from "@/app/profile/Profile.module.css";

import type {
  ProfileActivityResponse,
  ProfileMutationResponse,
} from "./profileTypes";
import { ProfileDeleteModal } from "./ProfileDeleteModal";
import { ProfileStatusModal } from "./ProfileStatusModal";

const defaultAvatarUrl = "/utang-profile.png";

type StatusModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  redirectToHome?: boolean;
};

const initialStatusModal: StatusModalState = {
  isOpen: false,
  title: "",
  message: "",
  icon: "🌰",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

async function readProfileMutationResponse(
  response: Response,
): Promise<ProfileMutationResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as ProfileMutationResponse;
    } catch {
      // Fall through to a friendly message below.
    }
  }

  if (response.status === 413) {
    return {
      ok: false,
      message: "이미지는 4MB 이하로 올려주세요.",
    };
  }

  return {
    ok: false,
    message: "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.",
  };
}

export function ProfileDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activity, setActivity] =
    useState<ProfileActivityResponse | null>(null);
  const [nickname, setNickname] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<
    "image" | "nickname" | "password" | "account" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusModal, setStatusModal] =
    useState<StatusModalState>(initialStatusModal);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef("");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const meResponse = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (meResponse.status === 401) {
          if (isActive) {
            setUser(null);
          }
          return;
        }

        if (!meResponse.ok) {
          throw new Error("주민 정보를 불러오지 못했어요.");
        }

        const meData = (await meResponse.json()) as MeResponse;

        if (!meData.authenticated || !meData.user) {
          if (isActive) {
            setUser(null);
          }
          return;
        }

        if (isActive) {
          setUser(meData.user);
          setNickname(meData.user.nickname);
        }

        const activityResponse = await fetch("/api/profile/activity", {
          credentials: "include",
          cache: "no-store",
        });
        const activityData =
          (await activityResponse.json()) as ProfileActivityResponse;

        if (isActive) {
          setActivity(activityData);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "주민 정보를 불러오지 못했어요.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  function showStatus(
    nextStatus: Omit<StatusModalState, "isOpen">,
  ) {
    setStatusModal({
      ...nextStatus,
      isOpen: true,
    });
  }

  function closeStatus() {
    if (statusModal.redirectToHome) {
      window.location.href = "/";
      return;
    }

    setStatusModal(initialStatusModal);
  }

  function handleImageSelection(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl("");
      return;
    }

    const validation = validateProfileImageMetadata(file);

    if (!validation.ok) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedImage(null);
      setPreviewUrl("");
      showStatus({
        title: "이미지를 확인해 주세요",
        message: validation.message,
        icon: "🥺",
      });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setSelectedImage(file);
    setPreviewUrl(nextPreviewUrl);
  }

  async function handleImageUpload() {
    if (!selectedImage) {
      showStatus({
        title: "이미지를 골라주세요",
        message: "새 주민증에 사용할 사진을 먼저 선택해 주세요.",
        icon: "📷",
      });
      return;
    }

    const formData = new FormData();
    formData.set("image", selectedImage);

    try {
      setActiveRequest("image");

      const response = await fetch("/api/profile/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await readProfileMutationResponse(response);

      if (!response.ok || !result.ok || !result.profileImage) {
        throw new Error(result.message ?? "이미지를 저장하지 못했어요.");
      }

      setUser((current) =>
        current
          ? {
              ...current,
              profileImage: result.profileImage ?? null,
            }
          : current,
      );
      handleImageSelection(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showStatus({
        title: "새 주민 사진이 생겼숭",
        message: "광장과 주민 명부에도 새 사진이 함께 표시돼요.",
        icon: "📸",
      });
    } catch (error) {
      showStatus({
        title: "이미지를 저장하지 못했어요",
        message:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
        icon: "🥺",
      });
    } finally {
      setActiveRequest(null);
    }
  }

  async function handleImageRemoval() {
    try {
      setActiveRequest("image");

      const response = await fetch("/api/profile/image", {
        method: "DELETE",
        credentials: "include",
      });
      const result = await readProfileMutationResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "기본 이미지로 바꾸지 못했어요.");
      }

      setUser((current) =>
        current
          ? {
              ...current,
              profileImage: null,
            }
          : current,
      );
      handleImageSelection(null);

      showStatus({
        title: "기본 사진으로 돌아왔숭",
        message: "언제든 새로운 주민 사진을 다시 올릴 수 있어요.",
        icon: "🌰",
      });
    } catch (error) {
      showStatus({
        title: "이미지를 바꾸지 못했어요",
        message:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
        icon: "🥺",
      });
    } finally {
      setActiveRequest(null);
    }
  }

  async function handleNicknameSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setActiveRequest("nickname");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });
      const result = await readProfileMutationResponse(response);

      if (!response.ok || !result.ok || !result.user) {
        throw new Error(result.message ?? "닉네임을 바꾸지 못했어요.");
      }

      setUser(result.user);
      setNickname(result.user.nickname);
      showStatus({
        title: "주민 이름이 바뀌었숭",
        message: "광장에 남긴 이야기와 댓글에도 새 이름이 표시돼요.",
        icon: "✏️",
      });
    } catch (error) {
      showStatus({
        title: "닉네임을 바꾸지 못했어요",
        message:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
        icon: "🥺",
      });
    } finally {
      setActiveRequest(null);
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showStatus({
        title: "새 비밀번호를 확인해 주세요",
        message: "새 비밀번호와 확인 값이 서로 달라요.",
        icon: "🔐",
      });
      return;
    }

    try {
      setActiveRequest("password");

      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const result = await readProfileMutationResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "비밀번호를 바꾸지 못했어요.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showStatus({
        title: "비밀번호가 바뀌었숭",
        message:
          result.message ??
          "안전을 위해 새 비밀번호로 다시 입장해 주세요.",
        icon: "🔐",
        actionLabel: "다시 입장하러 가기",
        redirectToHome: true,
      });
    } catch (error) {
      showStatus({
        title: "비밀번호를 바꾸지 못했어요",
        message:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
        icon: "🥺",
      });
    } finally {
      setActiveRequest(null);
    }
  }

  async function handleAccountDelete() {
    if (!deletePassword || activeRequest === "account") {
      return;
    }

    try {
      setActiveRequest("account");

      const response = await fetch("/api/profile", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const result = await readProfileMutationResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "회원 탈퇴를 완료하지 못했어요.");
      }

      setDeletePassword("");
      setIsDeleteModalOpen(false);
      showStatus({
        title: "탈퇴되었숭",
        message: "그동안 우땅랜드와 함께해 주셔서 고마워요.",
        icon: "🌰",
        actionLabel: "우땅랜드로 돌아가기",
        redirectToHome: true,
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      showStatus({
        title: "회원 탈퇴를 완료하지 못했어요",
        message:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
        icon: "🥺",
      });
    } finally {
      setActiveRequest(null);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.messageCard}>
          <span className={styles.loadingIcon} aria-hidden="true">
            🌰
          </span>
          <p>주민증을 찾고 있어요...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !user) {
    return (
      <main className={styles.page}>
        <div className={styles.messageCard}>
          <span className={styles.largeIcon} aria-hidden="true">
            {errorMessage ? "🥺" : "🐾"}
          </span>
          <h1>
            {errorMessage
              ? "주민증을 불러오지 못했어요"
              : "입장이 필요한 곳이에요"}
          </h1>
          <p>
            {errorMessage ||
              "우땅 주민증은 로그인한 주민만 확인할 수 있어요."}
          </p>
          <Link href="/" className={styles.homeLink}>
            우땅랜드로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const residentNumber = String(user.id)
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
  const profileImage =
    previewUrl || user.profileImage?.trim() || defaultAvatarUrl;
  const roleLabel =
    user.role === "admin" ? "우땅랜드 관리소장" : "우땅랜드 주민";
  const summary = activity?.summary ?? {
    postCount: 0,
    commentCount: 0,
    receivedLikeCount: 0,
  };

  return (
    <main className={styles.page}>
      <section className={styles.profileSection}>
        <div className={styles.titleArea}>
          <span className={styles.eyebrow}>
            UTANGLAND RESIDENT CARD
          </span>
          <h1>우땅 주민증</h1>
          <p>내 주민증과 우땅랜드 활동을 한곳에서 관리해요.</p>
        </div>

        <article className={styles.residentCard}>
          <div className={styles.cardDecoration} aria-hidden="true">
            🌰
          </div>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardLabel}>UTANGLAND</span>
              <h2>우땅 주민증</h2>
            </div>
            <span className={styles.levelBadge}>우다다 Lv.1</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.avatarFrame}>
              <img
                key={profileImage}
                src={profileImage}
                alt={`${user.nickname}님의 프로필`}
                width={150}
                height={150}
                className={styles.avatar}
                onError={(event) => {
                  event.currentTarget.src = defaultAvatarUrl;
                }}
              />
            </div>

            <dl className={styles.information}>
              <div className={styles.informationRow}>
                <dt>주민 이름</dt>
                <dd>{user.nickname}</dd>
              </div>
              <div className={styles.informationRow}>
                <dt>주민 번호</dt>
                <dd>UTANG-{residentNumber}</dd>
              </div>
              <div className={styles.informationRow}>
                <dt>주민 등급</dt>
                <dd>{roleLabel}</dd>
              </div>
              <div className={styles.informationRow}>
                <dt>이메일</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.cardFooter}>
            <span>오늘도 우땅이와 함께</span>
            <strong>UTANGLAND</strong>
          </div>
        </article>

        <section className={styles.stats} aria-label="나의 활동 요약">
          <article>
            <strong>{summary.postCount}</strong>
            <span>광장 이야기</span>
          </article>
          <article>
            <strong>{summary.commentCount}</strong>
            <span>작성한 댓글</span>
          </article>
          <article>
            <strong>{summary.receivedLikeCount}</strong>
            <span>받은 좋아요</span>
          </article>
        </section>

        <section className={styles.managementGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span aria-hidden="true">📷</span>
              <div>
                <h2>주민 사진</h2>
                <p>JPG, PNG, WebP · 최대 4MB</p>
              </div>
            </div>

            <label className={styles.filePicker}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={activeRequest === "image"}
                onChange={(event) =>
                  handleImageSelection(event.target.files?.[0] ?? null)
                }
              />
              <span>
                {selectedImage
                  ? selectedImage.name
                  : "새 사진 고르기"}
              </span>
            </label>

            <p className={styles.fileNotice}>
              선택 가능한 최대 크기:{" "}
              {PROFILE_IMAGE_MAX_BYTES / 1024 / 1024}MB
            </p>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={
                  activeRequest === "image" || !selectedImage
                }
                onClick={handleImageUpload}
              >
                {activeRequest === "image"
                  ? "사진 저장 중..."
                  : "사진 저장하기"}
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                disabled={
                  activeRequest === "image" || !user.profileImage
                }
                onClick={handleImageRemoval}
              >
                기본 사진으로
              </button>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span aria-hidden="true">✏️</span>
              <div>
                <h2>주민 이름</h2>
                <p>다른 주민과 같은 닉네임도 사용할 수 있어요.</p>
              </div>
            </div>

            <form
              className={styles.form}
              onSubmit={handleNicknameSubmit}
            >
              <label>
                <span>닉네임</span>
                <input
                  type="text"
                  value={nickname}
                  minLength={2}
                  maxLength={20}
                  disabled={activeRequest === "nickname"}
                  onChange={(event) => setNickname(event.target.value)}
                  required
                />
              </label>
              <button
                type="submit"
                className={styles.primaryAction}
                disabled={
                  activeRequest === "nickname" ||
                  nickname.trim() === user.nickname
                }
              >
                {activeRequest === "nickname"
                  ? "이름 변경 중..."
                  : "닉네임 변경하기"}
              </button>
            </form>
          </article>

          <article className={`${styles.panel} ${styles.passwordPanel}`}>
            <div className={styles.panelHeading}>
              <span aria-hidden="true">🔐</span>
              <div>
                <h2>비밀번호</h2>
                <p>변경 후에는 모든 기기에서 다시 로그인해요.</p>
              </div>
            </div>

            <form
              className={styles.form}
              onSubmit={handlePasswordSubmit}
            >
              <label>
                <span>현재 비밀번호</span>
                <input
                  type="password"
                  value={currentPassword}
                  autoComplete="current-password"
                  disabled={activeRequest === "password"}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  required
                />
              </label>
              <label>
                <span>새 비밀번호</span>
                <input
                  type="password"
                  value={newPassword}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  disabled={activeRequest === "password"}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  required
                />
              </label>
              <label>
                <span>새 비밀번호 확인</span>
                <input
                  type="password"
                  value={confirmPassword}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  disabled={activeRequest === "password"}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />
              </label>
              <button
                type="submit"
                className={styles.primaryAction}
                disabled={activeRequest === "password"}
              >
                {activeRequest === "password"
                  ? "비밀번호 변경 중..."
                  : "비밀번호 변경하기"}
              </button>
            </form>
          </article>
        </section>

        <section className={styles.dangerZone}>
          <div>
            <span>ACCOUNT MANAGEMENT</span>
            <h2>주민 계정 관리</h2>
            <p>
              회원 탈퇴 시 주민증과 우땅랜드의 모든 활동이 함께
              삭제돼요.
            </p>
          </div>
          {user.role === "admin" ? (
            <span className={styles.protectedAdmin}>
              관리소장 계정은 보호되고 있어요.
            </span>
          ) : (
            <button
              type="button"
              className={styles.deleteAccountButton}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              회원 탈퇴
            </button>
          )}
        </section>

        <section className={styles.activitySection}>
          <div className={styles.activityHeading}>
            <div>
              <span>MY ACTIVITY</span>
              <h2>최근 우땅랜드 활동</h2>
            </div>
            <Link href="/community">우땅 광장으로 →</Link>
          </div>

          <div className={styles.activityGrid}>
            <ActivityList
              title="내가 남긴 이야기"
              emptyMessage="아직 남긴 이야기가 없어요."
              items={(activity?.recentPosts ?? []).map((post) => ({
                id: post.id,
                href: `/community/${post.id}`,
                title: post.title,
                description: formatDate(post.createdAt),
              }))}
            />
            <ActivityList
              title="내가 남긴 댓글"
              emptyMessage="아직 남긴 댓글이 없어요."
              items={(activity?.recentComments ?? []).map((comment) => ({
                id: comment.id,
                href: `/community/${comment.postId}`,
                title: comment.postTitle,
                description: comment.content,
              }))}
            />
          </div>
        </section>

        <Link href="/" className={styles.backLink}>
          ← 우땅랜드로 돌아가기
        </Link>
      </section>

      <ProfileStatusModal
        isOpen={statusModal.isOpen}
        title={statusModal.title}
        message={statusModal.message}
        icon={statusModal.icon}
        actionLabel={statusModal.actionLabel}
        onClose={closeStatus}
      />

      <ProfileDeleteModal
        isOpen={isDeleteModalOpen}
        isProcessing={activeRequest === "account"}
        password={deletePassword}
        onPasswordChange={setDeletePassword}
        onCancel={() => {
          setDeletePassword("");
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleAccountDelete}
      />
    </main>
  );
}

type ActivityListProps = {
  title: string;
  emptyMessage: string;
  items: Array<{
    id: string;
    href: string;
    title: string;
    description: string;
  }>;
};

function ActivityList({
  title,
  emptyMessage,
  items,
}: ActivityListProps) {
  return (
    <article className={styles.activityCard}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.activityEmpty}>{emptyMessage}</p>
      ) : (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
