"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TaskForm from "./task-form";
import TaskList from "./task-list";
import TaskFiltersComponent from "./task-filters";
import { useSocket } from "@/contexts/socket-context";
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
import { LogOut, LayoutDashboard, PlusCircle, CheckCircle2, Calendar, Mail, Kanban, List, Users, Wifi, WifiOff } from "lucide-react";

// Dynamic import para evitar problemas de SSR con drag & drop
const KanbanBoard = dynamic(() => import("@/components/kanban/kanban-board"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function TaskDashboard({
  token,
  userId,
  userEmail,
}: {
  token: string;
  userId: string;
  userEmail: string | null;
}) {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const {
    tasks,
    loading,
    editingTask,
    filters,
    handleSubmit,
    handleDeleteTask,
    handleToggleCompletion,
    handleEditTask,
    handleCancelEdit,
    handleFilterChange,
    handleLogout,
  } = useTasks(token);

  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Real-time socket connection
  const { isConnected, onlineCount, subscribe } = useSocket();

  // Subscribe to real-time task events
  useEffect(() => {
    const unsubCreated = subscribe("task:created", (data) => {
      // Refresh tasks when a new task is created by another user
      if (data.creatorId !== userId) {
        handleFilterChange(filters);
      }
    });

    const unsubUpdated = subscribe("task:updated", (data) => {
      // Refresh tasks when a task is updated
      if (data.updaterId !== userId) {
        handleFilterChange(filters);
      }
    });

    const unsubDeleted = subscribe("task:deleted", (data) => {
      // Refresh tasks when a task is deleted
      if (data.deleterId !== userId) {
        handleFilterChange(filters);
      }
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [subscribe, userId, filters, handleFilterChange]);

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

  // Count tasks by priority
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  // Prepare tasks for kanban view
  const kanbanTasks = {
    todo: filteredTasks.filter((t) => !t.completed),
    completed: filteredTasks.filter((t) => t.completed),
  };

  // Callback when tasks change in kanban (to refresh the list)
  const handleTasksChange = () => {
    // The useTasks hook should handle this, but we can force a refresh if needed
  };

  return (
    <div className="w-full max-w-5xl space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md border rounded-2xl p-4 md:px-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="capitalize">{currentDate}</span>
            </div>
            {userEmail && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Online status indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{onlineCount}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-muted-foreground">Offline</span>
              </>
            )}
          </div>
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {highPriorityCount} urgente{highPriorityCount !== 1 ? 's' : ''}
            </Badge>
          )}
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
                onSubmit={handleSubmit}
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
              <div className="p-4 flex flex-col gap-4 border-b">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">Tus tareas</h3>
                    </div>
                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-7 px-2"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "kanban" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className="h-7 px-2"
                      >
                        <Kanban className="w-4 h-4" />
                      </Button>
                    </div>
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

                <TaskFiltersComponent
                  token={token}
                  onFilterChange={handleFilterChange}
                  activeFilters={filters}
                />
              </div>

              <div className="p-4 overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Cargando tareas...</p>
                  </div>
                ) : viewMode === "kanban" ? (
                  <div className="overflow-x-auto -mx-4 px-4">
                    <KanbanBoard
                      tasks={kanbanTasks}
                      token={token}
                      onTaskClick={handleEditTask}
                      onTasksChange={handleTasksChange}
                    />
                  </div>
                ) : (
                  <>
                    <TabsContent value="all" className="mt-0 focus-visible:ring-0">
                      <TaskList
                        tasks={filteredTasks}
                        onDelete={handleDeleteTask}
                        onToggleCompletion={handleToggleCompletion}
                        onEdit={handleEditTask}
                      />
                    </TabsContent>

                    <TabsContent value="mis-tareas" className="mt-0 focus-visible:ring-0">
                      <TaskList
                        tasks={filteredTasks}
                        onDelete={handleDeleteTask}
                        onToggleCompletion={handleToggleCompletion}
                        onEdit={handleEditTask}
                      />
                    </TabsContent>

                    <TabsContent value="completadas" className="mt-0 focus-visible:ring-0">
                      <TaskList
                        tasks={filteredTasks}
                        onDelete={handleDeleteTask}
                        onToggleCompletion={handleToggleCompletion}
                        onEdit={handleEditTask}
                      />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
