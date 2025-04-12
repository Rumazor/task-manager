import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth";

import type { Task } from "@/lib/types";
import {
  createTaskAction,
  deleteTaskAction,
  getTasksAction,
  updateTaskAction,
} from "@/components/tasks/actions";

export function useTasks(token: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  async function loadTasks() {
    try {
      setLoading(true);
      const result = await getTasksAction(token);
      if (result.success && result.tasks) {
        setTasks(result.tasks);
      } else {
        toast({
          title: "Error",
          description: result.error || "Ocurrió un error al cargar las tareas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(id: string, title: string, description: string) {
    try {
      if (id) {
        const updatedTask = await updateTaskAction(
          Number(id),
          title,
          description,
          token
        );

        if (updatedTask.success && updatedTask.task) {
          setTasks((prev) =>
            prev.map((task) => (task.id === id ? updatedTask.task : task))
          );
          setEditingTask(null);
          toast({
            title: "Éxito",
            description: "Tarea modificada exitosamente.",
          });
        } else {
          setEditingTask(null);
          throw new Error(updatedTask.error || "Failed to update task.");
        }
      } else {
        const createdTask = await createTaskAction(
          title,
          description,
          false,
          token
        );
        if (createdTask.success && createdTask.task) {
          setTasks((prev) => [...prev, createdTask.task.data]);
          toast({
            title: "Éxito",
            description: "Tarea creada exitosamente.",
          });
        } else {
          throw new Error(createdTask.error || "Failed to create task.");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: id ? `${error}` : "Failed to create task.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      const deleted = await deleteTaskAction(Number(id), token);
      if (deleted.success) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        toast({
          title: "Éxito",
          description: "Tarea borrada exitosamente",
        });
      } else {
        throw new Error(deleted.error || "Failed to delete task.");
      }
    } catch (error) {
      toast({
        title: "Failed to delete task.",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }

  async function handleToggleCompletion(id: string) {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updated = await updateTaskAction(
        Number(id),
        task.title,
        task.description ?? "",
        token,
        !task.completed
      );

      if (updated.success && updated.task) {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated.task : t)));
        toast({
          title: "Success",
          description: `Task marked as ${
            updated.task.completed ? "completed" : "incomplete"
          }.`,
        });
      } else {
        throw new Error(updated.error || "Failed to toggle task.");
      }
    } catch (error) {
      toast({
        title: "Failed to toggle task.",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  async function handleLogout() {
    try {
      await logoutAction();
      router.push("/");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    editingTask,
    handleSubmit,
    handleDeleteTask,
    handleToggleCompletion,
    handleEditTask,
    handleCancelEdit,
    handleLogout,
  };
}
