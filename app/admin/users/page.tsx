import Link from "next/link";

import { AdminUserList } from "@/components/admin/AdminUserList";
import { SiteBrand } from "@/components/site/SiteBrand";
import styles from "@/components/admin/Admin.module.css";
import { parseAdminPage } from "@/lib/admin";

type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const query = await searchParams;
  const page = parseAdminPage(query.page ?? null);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <SiteBrand compact />

          <Link href="/" className={styles.homeLink}>
            ← 우땅랜드로
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>UTANGLAND ADMIN</p>
          <h1>주민 관리소</h1>
          <p>
            우땅랜드에 등록된 주민과 관리소장 현황을 확인하는
            관리자 전용 공간이에요.
          </p>
        </section>

        <AdminUserList initialPage={page} />
      </div>
    </main>
  );
}
