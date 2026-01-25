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
    token: any
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

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTask) {
        await onSubmit(editingTask.id, title, description, token);
      } else {
        await onSubmit("", title, description, token);
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
