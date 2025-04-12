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
      <ul className="space-y-2">
        {tasks.map((task) => {
          const isExpanded = !!expandedTasks[task.id];
          const hasLongDescription =
            task.description && task.description.length > 60;

          return (
            <li
              key={task.id}
              className={`p-3 border rounded-lg flex items-start justify-between ${
                task.completed ? "bg-muted/50" : "bg-card"
              }`}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleCompletion(task.id)}
                  className="mt-1"
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
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>

                  {task.description && (
                    <p
                      className={`text-sm mt-0.5 text-muted-foreground ${
                        isExpanded ? "" : "line-clamp-1"
                      } transition-all duration-200`}
                    >
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.created_at)}</span>
                    </div>

                    {task.created_by && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                          {task.created_by}
                        </span>
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
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDeleteClick(task)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

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
