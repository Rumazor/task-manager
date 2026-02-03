"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Project } from "@/lib/types";
import { createProjectAction, updateProjectAction } from "@/components/tasks/actions";

interface ProjectFormProps {
  token: string;
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultColors = [
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#6366F1",
];

export default function ProjectForm({
  token,
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [color, setColor] = useState(project?.color || "#3B82F6");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setColor(project.color);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      if (project) {
        await updateProjectAction(project.id, name, description, color, token);
      } else {
        await createProjectAction(name, description, color, token);
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border rounded-lg p-3 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">
          {project ? "Editar Proyecto" : "Nuevo Proyecto"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onCancel}
          aria-label="Cerrar formulario de proyecto"
          title="Cerrar formulario de proyecto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Nombre del proyecto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-8"
        />

        <Textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="resize-none"
        />

        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <div className="flex gap-1.5">
            {defaultColors.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" className="flex-1" disabled={loading}>
          {loading ? "Guardando..." : project ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
