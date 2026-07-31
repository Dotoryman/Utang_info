import type { Metadata } from "next";

import styles from "@/components/legal/LegalPage.module.css";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 우땅랜드",
  description: "우땅랜드가 주민 정보를 처리하는 방법을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="UTANGLAND PRIVACY"
      title="개인정보 처리방침"
      intro="우땅랜드는 주민의 정보를 필요한 만큼만 안전하게 다루고, 서비스 운영 목적 외에는 사용하지 않습니다."
    >
      <section className={styles.section}>
        <h2>1. 수집하는 정보</h2>
        <ul>
          <li>회원가입 정보: 이메일, 닉네임, 암호화된 비밀번호</li>
          <li>선택 정보: 주민 프로필 이미지</li>
          <li>서비스 이용 정보: 게시글, 댓글, 좋아요, 알림, 로그인 세션</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. 이용 목적</h2>
        <p>
          주민 식별과 로그인 유지, 우땅 광장 운영, 작성자 표시, 알림 제공,
          서비스 보안과 오류 대응을 위해 사용합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. 보관과 삭제</h2>
        <p>
          회원 정보는 탈퇴할 때까지 보관합니다. 탈퇴하면 계정과 작성한
          게시글·댓글·좋아요·알림·세션을 함께 삭제합니다. 법령상 보관 의무가
          생기는 경우에는 해당 기간 동안 별도로 보관할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. 외부 서비스</h2>
        <p>
          서비스 제공을 위해 Cloudflare의 Workers, D1, R2와 보안 기능을
          사용합니다. 데이터는 해당 서비스의 운영 환경에서 처리될 수
          있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. 주민의 권리</h2>
        <p>
          주민증에서 닉네임과 프로필 이미지를 수정하고 비밀번호를 변경할 수
          있습니다. 회원 탈퇴 기능으로 저장된 계정 정보를 직접 삭제할 수
          있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. 문의</h2>
        <p>
          개인정보 처리와 관련한 문의는 우땅이 공식 Instagram
          <strong> @utang.co</strong>로 남겨 주세요.
        </p>
      </section>
    </LegalPage>
  );
}
