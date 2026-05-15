import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./bottom-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {children}
      {user ? <BottomNav /> : null}
    </>
  );
}
