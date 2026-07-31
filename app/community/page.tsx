import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityList } from "@/components/community/CommunityList";
import {
  normalizeCommunitySearch,
  parsePage,
} from "@/lib/community";

import styles from "@/components/community/Community.module.css";

type CommunityPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const query = await searchParams;
  const page = parsePage(query.page ?? null);
  const searchQuery = normalizeCommunitySearch(query.q);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <CommunityHeader />

        <section className={styles.hero}>
          <p className={styles.eyebrow}>UTANGLAND COMMUNITY</p>
          <h1>우땅 광장</h1>
          <p>
            오늘 있었던 재미있는 일과 다정한 한마디를 우땅랜드
            주민들과 나눠보세요.
          </p>
        </section>

        <CommunityList
          initialPage={page}
          initialQuery={searchQuery}
        />
      </div>
    </main>
  );
}
