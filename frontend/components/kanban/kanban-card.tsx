"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, GripVertical } from "lucide-react";
import type { Task } from "@/lib/types";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface KanbanCardProps {
  task: Task;
  onToggleCompletion: (id: string) => Promise<void>;
  onClick?: () => void;
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

export default function KanbanCard({
  task,
  onToggleCompletion,
  onClick,
}: KanbanCardProps) {
  // Ensure ID is always a string for consistent drag behavior
  const taskId = String(task.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = task.priority || "medium";
  const priorityInfo = priorityConfig[priority];

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-primary" : ""
      } ${task.completed ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleCompletion(taskId)}
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium text-sm truncate ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={`text-xs px-1.5 py-0 ${priorityInfo.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${priorityInfo.dotColor}`} />
              {priorityInfo.label}
            </Badge>

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), "d MMM", { locale: es })}
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[80px]">
                  {task.assignedTo.email.split("@")[0]}
                </span>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
