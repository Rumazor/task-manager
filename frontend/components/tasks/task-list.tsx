"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  return (
    <>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 border rounded-lg flex items-start justify-between ${
              task.completed ? "bg-muted/50" : "bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleCompletion(task.id)}
                className="mt-1"
              />
              <div className={task.completed ? "text-muted-foreground" : ""}>
                <h4
                  className={`font-medium ${
                    task.completed ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm mt-1">{task.description}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                disabled={task.completed}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(task)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la tarea "
              {taskToDelete?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Borrando..." : "Borrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
