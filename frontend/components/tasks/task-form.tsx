"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Plus, Tag as TagIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Task, Tag, User } from "@/lib/types";
import { getUsersAction, getTagsAction, createTagAction } from "./actions";

interface TaskFormProps {
  onSubmit: (
    id: string,
    title: string,
    description: string,
    token: string,
    assignedToId?: string,
    dueDate?: string,
    priority?: 'low' | 'medium' | 'high',
    tagIds?: number[]
  ) => Promise<void>;
  editingTask: Task | null;
  onCancel: () => void;
  token: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setAssignedToId(editingTask.assignedTo?.id);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : undefined);
      setPriority(editingTask.priority || 'medium');
      setSelectedTagIds(editingTask.tags?.map(t => t.id) || []);
    } else {
      setTitle("");
      setDescription("");
      setAssignedToId(undefined);
      setDueDate(undefined);
      setPriority('medium');
      setSelectedTagIds([]);
    }
  }, [editingTask]);

  useEffect(() => {
    async function fetchData() {
      const [usersResponse, tagsResponse] = await Promise.all([
        getUsersAction(token),
        getTagsAction(token),
      ]);

      if (usersResponse.success && usersResponse.users) {
        setUsers(usersResponse.users);
      }
      if (tagsResponse.success && tagsResponse.tags) {
        setTags(tagsResponse.tags);
      }
    }
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dueDateStr = dueDate ? dueDate.toISOString() : undefined;

      if (editingTask) {
        await onSubmit(
          editingTask.id,
          title,
          description,
          token,
          assignedToId,
          dueDateStr,
          priority,
          selectedTagIds
        );
      } else {
        await onSubmit(
          "",
          title,
          description,
          token,
          assignedToId,
          dueDateStr,
          priority,
          selectedTagIds
        );
      }
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority('medium');
      setSelectedTagIds([]);
      setAssignedToId(undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const response = await createTagAction(newTagName, newTagColor, token);
    if (response.success && response.tag) {
      setTags([...tags, response.tag]);
      setSelectedTagIds([...selectedTagIds, response.tag.id]);
      setNewTagName("");
      setShowNewTagForm(false);
    }
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Fecha límite</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs px-2",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {dueDate ? format(dueDate, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
                {dueDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setDueDate(undefined);
                        setCalendarOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Quitar fecha
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={priority} onValueChange={(v: 'low' | 'medium' | 'high') => setPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Baja
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Media
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Alta
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Etiquetas</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer transition-all"
                style={{
                  backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
                  borderColor: tag.color,
                  color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                }}
                onClick={() => toggleTagSelection(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
            {!showNewTagForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6"
                onClick={() => setShowNewTagForm(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nueva
              </Button>
            )}
          </div>

          {showNewTagForm && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Nombre"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 h-8"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <Button
                type="button"
                size="sm"
                className="h-8"
                onClick={handleCreateTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setShowNewTagForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {users.length > 0 && (
          <div className="space-y-2">
            <Label>Asignar a</Label>
            <Select value={assignedToId || "none"} onValueChange={(v) => setAssignedToId(v === "none" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
}
