"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Edit,
  Trash2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Task } from "@/lib/types";
import { useState } from "react";

import { formatDate } from "@/lib/utils";
import DeleteConfirmation from "./delete-confirmation";

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
  onToggleCompletion: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

export default function TaskList({
  tasks,
  onDelete,
  onToggleCompletion,
  onEdit,
}: TaskListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(
    {}
  );

  if (tasks.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        No se encontraron tareas. ¡Crea una para empezar!
      </p>
    );
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(taskToDelete.id);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => {
          const isExpanded = !!expandedTasks[task.id];
          const hasLongDescription =
            task.description && task.description.length > 80;

          return (
            <div
              key={task.id}
              className={`group relative overflow-hidden transition-all duration-300 border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md ${
                task.completed
                  ? "bg-muted/30 border-muted opacity-75"
                  : "bg-card border-border hover:border-primary/20 ring-1 ring-transparent hover:ring-primary/5"
              }`}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleCompletion(task.id)}
                  className="mt-1"
                  aria-label={`Marcar como ${
                    task.completed ? "incompleta" : "completada"
                  }`}
                />
                <div
                  className={`${
                    task.completed ? "text-muted-foreground" : ""
                  } flex-1 min-w-0`}
                >
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium truncate ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </h4>

                    {hasLongDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={() => toggleTaskExpansion(task.id)}
                        aria-label={
                          isExpanded
                            ? "Contraer descripción"
                            : "Expandir descripción"
                        }
                        title={
                          isExpanded
                            ? "Contraer descripción"
                            : "Expandir descripción"
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                        onClick={() => handleDeleteClick(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {task.description && (
                    <div className="relative">
                      <p
                        className={`text-sm leading-relaxed transition-all duration-300 ${
                          task.completed ? "text-muted-foreground/60" : "text-muted-foreground"
                        } ${isExpanded ? "" : "line-clamp-2"}`}
                      >
                        {task.description}
                      </p>
                      {hasLongDescription && (
                        <button
                          onClick={() => toggleTaskExpansion(task.id)}
                          className="text-xs font-semibold text-primary hover:underline mt-1 focus:outline-none"
                        >
                          {isExpanded ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 border-t border-muted/30">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <div className="bg-muted p-1 rounded-sm">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span>{formatDate(task.created_at)}</span>
                    </div>

                    {task.created_by && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <div className="bg-muted p-1 rounded-sm">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="truncate max-w-[150px]">
                          {task.created_by}
                        </span>
                      </div>
                    )}

                    {task.completed && (
                      <div className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-tighter">
                        <div className="w-1 h-1 rounded-full bg-current" />
                        Completada
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(task)}
                  disabled={task.completed}
                  aria-label="Editar tarea"
                  title="Editar tarea"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDeleteClick(task)}
                  aria-label="Eliminar tarea"
                  title="Eliminar tarea"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </div>

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskToDelete={taskToDelete}
        isDeleting={isDeleting}
        confirmDelete={confirmDelete}
      />
    </>
  );
}
