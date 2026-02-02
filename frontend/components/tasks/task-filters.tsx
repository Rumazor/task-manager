"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Tag, TaskFilters } from "@/lib/types";
import { getTagsAction } from "./actions";

interface TaskFiltersProps {
  token: string;
  onFilterChange: (filters: TaskFilters) => void;
  activeFilters: TaskFilters;
}

export default function TaskFiltersComponent({
  token,
  onFilterChange,
  activeFilters,
}: TaskFiltersProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(activeFilters.search || "");
  const [dueBeforeDate, setDueBeforeDate] = useState<Date | undefined>(
    activeFilters.dueBefore ? new Date(activeFilters.dueBefore) : undefined
  );

  useEffect(() => {
    async function fetchTags() {
      const response = await getTagsAction(token);
      if (response.success && response.tags) {
        setTags(response.tags);
      }
    }
    fetchTags();
  }, [token]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ ...activeFilters, search: value || undefined });
  };

  const handlePriorityChange = (value: string) => {
    if (value === "all") {
      const { priority, ...rest } = activeFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...activeFilters,
        priority: value as 'low' | 'medium' | 'high',
      });
    }
  };

  const handleTagChange = (tagId: string) => {
    if (tagId === "all") {
      const { tagId: _, ...rest } = activeFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...activeFilters,
        tagId: parseInt(tagId),
      });
    }
  };

  const handleCompletedChange = (value: string) => {
    if (value === "all") {
      const { completed, ...rest } = activeFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...activeFilters,
        completed: value === "true",
      });
    }
  };

  const handleDueBeforeChange = (date: Date | undefined) => {
    setDueBeforeDate(date);
    if (date) {
      onFilterChange({
        ...activeFilters,
        dueBefore: date.toISOString(),
      });
    } else {
      const { dueBefore, ...rest } = activeFilters;
      onFilterChange(rest);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDueBeforeDate(undefined);
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key as keyof TaskFilters] !== undefined
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Prioridad
            </label>
            <Select
              value={activeFilters.priority || "all"}
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Alta
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Media
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Baja
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Etiqueta
            </label>
            <Select
              value={activeFilters.tagId?.toString() || "all"}
              onValueChange={handleTagChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Estado
            </label>
            <Select
              value={
                activeFilters.completed === undefined
                  ? "all"
                  : activeFilters.completed.toString()
              }
              onValueChange={handleCompletedChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="false">Pendientes</SelectItem>
                <SelectItem value="true">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Vence antes de
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueBeforeDate
                    ? format(dueBeforeDate, "d MMM", { locale: es })
                    : "Seleccionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueBeforeDate}
                  onSelect={handleDueBeforeChange}
                  initialFocus
                />
                {dueBeforeDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDueBeforeChange(undefined)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Quitar fecha
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.priority && (
            <Badge variant="secondary" className="text-xs">
              Prioridad: {activeFilters.priority === 'high' ? 'Alta' : activeFilters.priority === 'medium' ? 'Media' : 'Baja'}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handlePriorityChange("all")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.tagId && (
            <Badge variant="secondary" className="text-xs">
              Etiqueta: {tags.find((t) => t.id === activeFilters.tagId)?.name}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handleTagChange("all")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.completed !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Estado: {activeFilters.completed ? "Completadas" : "Pendientes"}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handleCompletedChange("all")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.dueBefore && (
            <Badge variant="secondary" className="text-xs">
              Vence antes: {format(new Date(activeFilters.dueBefore), "d MMM", { locale: es })}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handleDueBeforeChange(undefined)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.search && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: {activeFilters.search}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
