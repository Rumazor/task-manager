"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { Task } from "@/lib/types";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import DeleteConfirmation from "./delete-confirmation";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
  onToggleCompletion: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

const priorityConfig = {
  low: {
    label: "Baja",
    className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  medium: {
    label: "Media",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  high: {
    label: "Alta",
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    dotColor: "bg-red-500",
  },
};

function getDueDateInfo(dueDate: string) {
  const date = new Date(dueDate);
  const isOverdue = isPast(date) && !isToday(date);

  if (isOverdue) {
    return {
      label: "Vencida",
      className: "text-red-600 dark:text-red-400",
      icon: AlertTriangle,
    };
  }
  if (isToday(date)) {
    return {
      label: "Hoy",
      className: "text-orange-600 dark:text-orange-400",
      icon: Clock,
    };
  }
  if (isTomorrow(date)) {
    return {
      label: "Mañana",
      className: "text-blue-600 dark:text-blue-400",
      icon: Calendar,
    };
  }
  return {
    label: format(date, "d MMM", { locale: es }),
    className: "text-muted-foreground",
    icon: Calendar,
  };
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
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  if (tasks.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        No se encontraron tareas. Crea una para empezar!
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

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleSubtasksExpansion = (taskId: string) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => {
          const isExpanded = !!expandedTasks[task.id];
          const hasLongDescription = task.description && task.description.length > 80;
          const priority = task.priority || 'medium';
          const priorityInfo = priorityConfig[priority];
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          const subtasksExpanded = !!expandedSubtasks[task.id];

          return (
            <div
              key={task.id}
              className={`group relative overflow-hidden transition-all duration-300 border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md ${
                task.completed
                  ? "bg-muted/30 border-muted opacity-75"
                  : "bg-card border-border hover:border-primary/20 ring-1 ring-transparent hover:ring-primary/5"
              }`}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleCompletion(task.id)}
                  className="mt-1"
                  aria-label={`Marcar como ${task.completed ? "incompleta" : "completada"}`}
                />
                <div className={`${task.completed ? "text-muted-foreground" : ""} flex-1 min-w-0`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </h4>

                      <Badge variant="secondary" className={`shrink-0 text-xs px-2 py-0 ${priorityInfo.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${priorityInfo.dotColor}`} />
                        {priorityInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasLongDescription && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleTaskExpansion(task.id)}
                          aria-label={isExpanded ? "Contraer descripcion" : "Expandir descripcion"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <div className="relative mt-1">
                      <p
                        className={`text-sm leading-relaxed transition-all duration-300 ${
                          task.completed ? "text-muted-foreground/60" : "text-muted-foreground"
                        } ${isExpanded ? "" : "line-clamp-2"}`}
                      >
                        {task.description}
                      </p>
                      {hasLongDescription && (
                        <button
                          onClick={() => toggleTaskExpansion(task.id)}
                          className="text-xs font-semibold text-primary hover:underline mt-1 focus:outline-none"
                        >
                          {isExpanded ? "Ver menos" : "Ver mas"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs px-2 py-0"
                          style={{
                            borderColor: tag.color,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Subtasks */}
                  {hasSubtasks && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => toggleSubtasksExpansion(task.id)}
                      >
                        <ChevronRight
                          className={`h-3 w-3 mr-1 transition-transform ${
                            subtasksExpanded ? "rotate-90" : ""
                          }`}
                        />
                        {task.subtasks!.length} subtareas
                        <span className="ml-1 text-muted-foreground/60">
                          ({task.subtasks!.filter((s) => s.completed).length} completadas)
                        </span>
                      </Button>

                      {subtasksExpanded && (
                        <div className="mt-2 ml-4 space-y-1 border-l-2 border-muted pl-3">
                          {task.subtasks!.map((subtask) => (
                            <div
                              key={subtask.id}
                              className={`flex items-center gap-2 text-sm ${
                                subtask.completed ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  priorityConfig[subtask.priority || 'medium'].dotColor
                                }`}
                              />
                              {subtask.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 border-t border-muted/30 mt-2">
                    {/* Due date */}
                    {task.dueDate && !task.completed && (
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${getDueDateInfo(task.dueDate).className}`}>
                        <div className="bg-muted p-1 rounded-sm">
                          {(() => {
                            const Icon = getDueDateInfo(task.dueDate).icon;
                            return <Icon className="h-3 w-3" />;
                          })()}
                        </div>
                        <span>{getDueDateInfo(task.dueDate).label}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <div className="bg-muted p-1 rounded-sm">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span>{formatDate(task.created_at)}</span>
                    </div>

                    {task.created_by && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <div className="bg-muted p-1 rounded-sm">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="truncate max-w-[150px]">{task.created_by}</span>
                      </div>
                    )}

                    {task.assignedTo && (
                      <div className="flex items-center gap-1 text-blue-600 text-xs">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                          Asignada a: {task.assignedTo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 ml-2 shrink-0 absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(task)}
                  disabled={task.completed}
                  aria-label="Editar tarea"
                  title="Editar tarea"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDeleteClick(task)}
                  aria-label="Eliminar tarea"
                  title="Eliminar tarea"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskToDelete={taskToDelete}
        isDeleting={isDeleting}
        confirmDelete={confirmDelete}
      />
    </>
  );
}
