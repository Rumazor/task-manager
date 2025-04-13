import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TaskDashboard from "@/components/tasks/task-dashboard";
import { getUserFromCookie } from "@/lib/auth";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const userId = (await getUserFromCookie())?.id ?? null;

  if (!token) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-50">
      <TaskDashboard token={token.value} userId={userId} />
    </main>
  );
}
