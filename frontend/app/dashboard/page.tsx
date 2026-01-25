import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TaskDashboard from "@/components/tasks/task-dashboard";
import { getUserFromCookie } from "@/lib/auth";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const user = await getUserFromCookie();

  if (!token) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-grid-pattern">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <TaskDashboard token={token.value} userId={user?.id ?? null} userEmail={user?.email ?? null} />
    </main>
  );
}
