import { CommunityDetail } from "@/components/community/CommunityDetail";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import styles from "@/components/community/Community.module.css";

type CommunityDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CommunityDetailPage({
  params,
}: CommunityDetailPageProps) {
  const { id } = await params;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <CommunityHeader />
        <CommunityDetail postId={id} />
      </div>
    </main>
  );
}
