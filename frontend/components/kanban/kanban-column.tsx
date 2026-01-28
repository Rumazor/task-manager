"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import KanbanCard from "./kanban-card";
import type { Task } from "@/lib/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
  onToggleCompletion: (id: string) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  color = "#3B82F6",
  onToggleCompletion,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[280px] bg-muted/30 rounded-xl border ${
        isOver ? "ring-2 ring-primary border-primary" : ""
      }`}
    >
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderTopColor: color, borderTopWidth: "3px" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[400px] min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              Sin tareas
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onToggleCompletion={onToggleCompletion}
                onClick={() => onTaskClick?.(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
