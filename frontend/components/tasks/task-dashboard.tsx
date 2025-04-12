"use client";

import TaskForm from "./task-form";
import TaskList from "./task-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";

export default function TaskDashboard({ token }: { token: string }) {
  const {
    tasks,
    loading,
    editingTask,
    handleSubmit,
    handleDeleteTask,
    handleToggleCompletion,
    handleEditTask,
    handleCancelEdit,
    handleLogout,
  } = useTasks(token);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Panel de tareas
            </CardTitle>
            <CardDescription>Gestiona tus tareas</CardDescription>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </CardHeader>
        <CardContent>
          <TaskForm
            onSubmit={(id, title, desc) => handleSubmit(id, title, desc)}
            editingTask={editingTask}
            onCancel={handleCancelEdit}
            token={token}
          />

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Lista de tareas</h3>
            {loading ? (
              <p className="text-center py-4">Cargando tareas...</p>
            ) : (
              <TaskList
                tasks={tasks}
                onDelete={handleDeleteTask}
                onToggleCompletion={handleToggleCompletion}
                onEdit={handleEditTask}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
