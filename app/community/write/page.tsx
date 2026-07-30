import { CommunityEditor } from "@/components/community/CommunityEditor";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import styles from "@/components/community/Community.module.css";

export default function CommunityWritePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <CommunityHeader />

        <section className={styles.hero}>
          <p className={styles.eyebrow}>NEW STORY</p>
          <h1>이야기 남기기</h1>
          <p>우땅 광장에 따뜻하고 즐거운 이야기를 남겨주세요.</p>
        </section>

        <CommunityEditor />
      </div>
    </main>
  );
}
