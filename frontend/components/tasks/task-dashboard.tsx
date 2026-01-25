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
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut, LayoutDashboard, PlusCircle, CheckCircle2 } from "lucide-react";

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
    <div className="w-full max-w-5xl space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md border rounded-2xl p-4 md:px-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
            <p className="text-xs text-muted-foreground font-medium">Panel de Control</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <ModeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Nueva Tarea</CardTitle>
              </div>
              <CardDescription>Agrega algo a tu lista</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <TaskForm
                onSubmit={(id, title, desc) => handleSubmit(id, title, desc)}
                editingTask={editingTask}
                onCancel={handleCancelEdit}
                token={token}
              />
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-1 shadow-sm">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveFilter}
            >
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Tus Tareas</h3>
                </div>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-background">
                    Todas
                    <Badge variant="secondary" className="ml-2 bg-background/50">
                      {allTasksCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="mis-tareas"
                    className="data-[state=active]:bg-background"
                  >
                    Mías
                    <Badge variant="secondary" className="ml-2 bg-background/50">
                      {myTasksCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completadas"
                    className="data-[state=active]:bg-background"
                  >
                    Hechas
                    <Badge variant="secondary" className="ml-2 bg-background/50">
                      {completedTasksCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4">
                <TabsContent value="all" className="mt-0 focus-visible:ring-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando tareas...</p>
                    </div>
                  ) : (
                    <TaskList
                      tasks={filteredTasks}
                      onDelete={handleDeleteTask}
                      onToggleCompletion={handleToggleCompletion}
                      onEdit={handleEditTask}
                    />
                  )}
                </TabsContent>

                <TabsContent value="mis-tareas" className="mt-0 focus-visible:ring-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando tareas...</p>
                    </div>
                  ) : (
                    <TaskList
                      tasks={filteredTasks}
                      onDelete={handleDeleteTask}
                      onToggleCompletion={handleToggleCompletion}
                      onEdit={handleEditTask}
                    />
                  )}
                </TabsContent>

                <TabsContent value="completadas" className="mt-0 focus-visible:ring-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando tareas...</p>
                    </div>
                  ) : (
                    <TaskList
                      tasks={filteredTasks}
                      onDelete={handleDeleteTask}
                      onToggleCompletion={handleToggleCompletion}
                      onEdit={handleEditTask}
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
