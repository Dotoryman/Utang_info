import type { Metadata } from "next";

import styles from "@/components/legal/LegalPage.module.css";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "이용약관 | 우땅랜드",
  description: "우땅랜드를 즐겁고 안전하게 이용하기 위한 약속입니다.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="UTANGLAND TERMS"
      title="우땅랜드 이용약관"
      intro="우땅랜드 주민 모두가 즐겁고 다정하게 머물 수 있도록 기본적인 이용 약속을 안내합니다."
    >
      <section className={styles.section}>
        <h2>1. 서비스 소개</h2>
        <p>
          우땅랜드는 우땅이 콘텐츠, 오늘의 운세와 행운 번호, 주민 프로필,
          게시글·댓글·좋아요·알림 기능을 제공하는 개인 취미 웹서비스입니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. 계정 이용</h2>
        <p>
          주민은 정확한 이메일을 사용하고 자신의 비밀번호를 안전하게 관리해야
          합니다. 다른 사람의 계정을 사용하거나 서비스의 보안을 방해해서는 안
          됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. 광장 이용 약속</h2>
        <ul>
          <li>다른 주민을 모욕하거나 괴롭히는 내용을 올리지 않습니다.</li>
          <li>개인정보, 불법 콘텐츠, 권리를 침해하는 자료를 게시하지 않습니다.</li>
          <li>반복 광고나 서비스 운영을 방해하는 활동을 하지 않습니다.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. 콘텐츠와 운영</h2>
        <p>
          주민은 자신이 작성한 콘텐츠에 대한 책임을 집니다. 운영자는 약관을
          위반하거나 서비스 안전을 해치는 게시글·댓글·계정을 삭제할 수
          있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. 오늘의 운세</h2>
        <p>
          우땅점술소의 운세와 행운 번호는 재미를 위한 무작위 콘텐츠이며 실제
          결과나 복권 당첨을 보장하지 않습니다. 중요한 결정을 위한 전문적인
          조언으로 사용하지 마세요.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. 변경과 중단</h2>
        <p>
          안정적인 운영과 기능 개선을 위해 서비스 내용이나 약관이 변경될 수
          있습니다. 중요한 변경 사항은 서비스 안에서 알기 쉽게 안내합니다.
        </p>
      </section>
    </LegalPage>
  );
}
