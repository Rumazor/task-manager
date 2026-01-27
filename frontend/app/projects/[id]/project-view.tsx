"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Settings,
  Plus,
} from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import TaskList from "@/components/tasks/task-list";
import type { Project, Task } from "@/lib/types";
import {
  getProjectAction,
  getProjectTasksAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/components/tasks/actions";

interface ProjectViewProps {
  projectId: number;
  token: string;
}

export default function ProjectView({ projectId, token }: ProjectViewProps) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<{ todo: Task[]; completed: Task[] }>({
    todo: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const loadData = async () => {
    setLoading(true);
    const [projectRes, tasksRes] = await Promise.all([
      getProjectAction(projectId, token),
      getProjectTasksAction(projectId, token),
    ]);

    if (projectRes.success) {
      setProject(projectRes.project);
    }

    if (tasksRes.success && tasksRes.tasks) {
      setTasks(tasksRes.tasks);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId, token]);

  const handleToggleCompletion = async (id: string) => {
    const allTasks = [...tasks.todo, ...tasks.completed];
    const task = allTasks.find((t) => t.id === id);
    if (!task) return;

    await updateTaskAction(Number(id), undefined, undefined, token, !task.completed);
    loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTaskAction(Number(id), token);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  const allTasks = [...tasks.todo, ...tasks.completed];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {project.stats?.total || 0} tareas
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {project.stats?.completed || 0} completadas
              </Badge>
              {project.stats?.byPriority?.high > 0 && (
                <Badge variant="destructive">
                  {project.stats.byPriority.high} urgentes
                </Badge>
              )}
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
              <TabsList className="h-9">
                <TabsTrigger value="kanban" className="px-3">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6">
          {view === "kanban" ? (
            <KanbanBoard
              tasks={tasks}
              token={token}
              onTasksChange={loadData}
            />
          ) : (
            <TaskList
              tasks={allTasks}
              onDelete={handleDeleteTask}
              onToggleCompletion={handleToggleCompletion}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
