import { PageContainer } from "@/components/layout/page-container";

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer withBottomNav>
        {children}
      </PageContainer>
    </main>
  );
}
