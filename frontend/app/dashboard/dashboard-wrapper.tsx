"use client";

import { SocketProvider } from "@/contexts/socket-context";
import TaskDashboard from "@/components/tasks/task-dashboard";

interface DashboardWrapperProps {
  token: string;
  userId: string | null;
  userEmail: string | null;
}

export default function DashboardWrapper({ token, userId, userEmail }: DashboardWrapperProps) {
  return (
    <SocketProvider token={token}>
      <TaskDashboard token={token} userId={userId} userEmail={userEmail} />
    </SocketProvider>
  );
}
