import { CommunityEditor } from "@/components/community/CommunityEditor";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import styles from "@/components/community/Community.module.css";

type CommunityEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CommunityEditPage({
  params,
}: CommunityEditPageProps) {
  const { id } = await params;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <CommunityHeader />

        <section className={styles.hero}>
          <p className={styles.eyebrow}>EDIT STORY</p>
          <h1>이야기 다듬기</h1>
          <p>남겨둔 이야기를 더 알맞게 다듬어보세요.</p>
        </section>

        <CommunityEditor postId={id} />
      </div>
    </main>
  );
}
