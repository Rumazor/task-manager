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
      <div>
        <Input
          placeholder="Titulo de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mb-2"
        />
        <Textarea
          placeholder="Descripción de la tarea (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
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
