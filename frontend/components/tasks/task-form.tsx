"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task, User } from "@/lib/types";
import { getUsersAction } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Select
          value={assignedToId || ""}
          onValueChange={(value) => {
            setAssignedToId(value === "unassigned" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Asignar a..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
