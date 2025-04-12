import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TaskDashboard from "@/components/tasks/task-dashboard";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-50">
      <TaskDashboard token={token.value}/>
    </main>
  );
}
