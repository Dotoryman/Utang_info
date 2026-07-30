"use client";

import styles from "./Community.module.css";

type CommunityAvatarProps = {
  profileImage: string | null;
  nickname: string;
  size?: "small" | "large";
};

const DEFAULT_PROFILE_IMAGE = "/utang-profile.png";

export function CommunityAvatar({
  profileImage,
  nickname,
  size = "small",
}: CommunityAvatarProps) {
  const imageSource =
    profileImage?.trim() || DEFAULT_PROFILE_IMAGE;

  return (
    <img
      key={imageSource}
      src={imageSource}
      alt={`${nickname}님의 프로필`}
      className={`${styles.avatar} ${
        size === "large" ? styles.avatarLarge : ""
      }`}
      width={size === "large" ? 64 : 46}
      height={size === "large" ? 64 : 46}
      onError={(event) => {
        event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
      }}
    />
  );
}
