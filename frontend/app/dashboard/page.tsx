import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardWrapper from "./dashboard-wrapper";
import { getUserFromCookie } from "@/lib/auth";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const user = await getUserFromCookie();

  if (!token) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-grid-pattern overflow-x-hidden">
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <DashboardWrapper token={token.value} userId={user?.id ?? null} userEmail={user?.email ?? null} />
    </main>
  );
}
