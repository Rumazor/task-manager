"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Task } from "@/lib/types";

interface TaskFormProps {
  onSubmit: (
    id: string,
    title: string,
    description: string,
    token: any,
    assignedToId?: string
  ) => Promise<void>;
  editingTask: Task | null;
  onCancel: () => void;
  token: string;
}

export default function TaskForm({
  onSubmit,
  editingTask,
  onCancel,
  token,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assignedToId, setAssignedToId] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setAssignedToId(editingTask.assignedTo?.id);
    } else {
      setTitle("");
      setDescription("");
      setAssignedToId(undefined);
    }
  }, [editingTask]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await getUsersAction(token);
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        console.error("Error al obtener usuarios:", response.error);
      }
    }
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTask) {
        await onSubmit(editingTask.id, title, description, token, assignedToId);
      } else {
        await onSubmit("", title, description, token, assignedToId);
      }
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title" className="flex items-center gap-1">
            Título de la tarea <span className="text-destructive">*</span>
          </Label>
          <Input
            id="task-title"
            placeholder="Ej: Comprar leche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="task-description">Descripción (opcional)</Label>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider bg-muted/50 px-1.5 py-0.5 rounded">
              {description.length} / 500
            </span>
          </div>
          <Textarea
            id="task-description"
            placeholder="Detalles adicionales sobre la tarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" disabled={loading} className="w-full h-10 shadow-sm">
          {loading
            ? "Guardando..."
            : editingTask
            ? "Actualizar Tarea"
            : "Crear Tarea"}
        </Button>
        {editingTask && (
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full h-10">
            Cancelar Edición
          </Button>
        )}
      </div>
    </form>
  );
}
