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
          <Label htmlFor="task-title">Título de la tarea</Label>
          <Input
            id="task-title"
            placeholder="Ej: Comprar leche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-description">Descripción (opcional)</Label>
          <Textarea
            id="task-description"
            placeholder="Detalles adicionales sobre la tarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : editingTask
            ? "Editar tarea"
            : "Agregar tarea"}
        </Button>
        {editingTask && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
