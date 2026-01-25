"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Título
          </label>
          <Input
            placeholder="¿Qué hay que hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-10 focus-visible:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Descripción
          </label>
          <Textarea
            placeholder="Detalles adicionales (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none focus-visible:ring-primary/20 transition-all shadow-sm"
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
