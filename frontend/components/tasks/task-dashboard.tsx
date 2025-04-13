"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";

export default function TaskDashboard({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
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

  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "mis-tareas") {
      return task.user_id === userId;
    } else if (activeFilter === "completadas") {
      return task.completed;
    }
    return true;
  });

  const myTasksCount = tasks.filter((task) => task.user_id === userId).length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const allTasksCount = tasks.length;

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
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveFilter}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Lista de tareas</h3>
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    Todas
                    <Badge variant="secondary" className="ml-1">
                      {allTasksCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="mis-tareas"
                    className="flex items-center gap-2"
                  >
                    Mis tareas
                    <Badge variant="secondary" className="ml-1">
                      {myTasksCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completadas"
                    className="flex items-center gap-2"
                  >
                    Completadas
                    <Badge variant="secondary" className="ml-1">
                      {completedTasksCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {loading ? (
                  <p className="text-center py-4">Cargando tareas...</p>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onDelete={handleDeleteTask}
                    onToggleCompletion={handleToggleCompletion}
                    onEdit={handleEditTask}
                  />
                )}
              </TabsContent>

              <TabsContent value="mis-tareas" className="mt-0">
                {loading ? (
                  <p className="text-center py-4">Cargando tareas...</p>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onDelete={handleDeleteTask}
                    onToggleCompletion={handleToggleCompletion}
                    onEdit={handleEditTask}
                  />
                )}
              </TabsContent>

              <TabsContent value="completadas" className="mt-0">
                {loading ? (
                  <p className="text-center py-4">Cargando tareas...</p>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onDelete={handleDeleteTask}
                    onToggleCompletion={handleToggleCompletion}
                    onEdit={handleEditTask}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
