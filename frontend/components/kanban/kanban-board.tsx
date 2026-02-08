"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./kanban-column";
import KanbanCard from "./kanban-card";
import type { Task, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { updateTaskAction, reorderTasksAction } from "@/components/tasks/actions";

interface KanbanBoardProps {
  tasks: {
    todo: Task[];
    completed: Task[];
  };
  token: string;
  onTaskClick?: (task: Task) => void;
  onTasksChange?: () => void;
}

export default function KanbanBoard({
  tasks,
  token,
  onTaskClick,
  onTasksChange,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnType[]>([
    { id: "todo", title: "Pendientes", tasks: tasks.todo || [] },
    { id: "completed", title: "Completadas", tasks: tasks.completed || [] },
  ]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setColumns([
      { id: "todo", title: "Pendientes", tasks: tasks.todo || [] },
      { id: "completed", title: "Completadas", tasks: tasks.completed || [] },
    ]);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (taskId: string | number) => {
    const id = String(taskId);
    return columns.find((col) => col.tasks.some((t) => String(t.id) === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    const column = findColumn(activeId);
    if (column) {
      const task = column.tasks.find((t) => String(t.id) === activeId);
      if (task) setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = findColumn(activeId);
    const overColumn =
      columns.find((col) => col.id === overId) ||
      findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns((prev) => {
      const activeTask = activeColumn.tasks.find((t) => String(t.id) === activeId);
      if (!activeTask) return prev;

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => String(t.id) !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const overIndex = col.tasks.findIndex((t) => String(t.id) === overId);
          const newIndex = overIndex >= 0 ? overIndex : col.tasks.length;
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, activeTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = findColumn(activeId);
    const overColumn =
      columns.find((col) => col.id === overId) ||
      findColumn(overId);

    if (!activeColumn || !overColumn) return;

    // Update task completion status if moved between columns
    if (activeColumn.id !== overColumn.id) {
      const isCompleted = overColumn.id === "completed";
      await updateTaskAction(
        Number(activeId),
        undefined,
        undefined,
        token,
        isCompleted
      );
      onTasksChange?.();
    }

    // Reorder within the same column
    if (activeColumn.id === overColumn.id && activeId !== overId) {
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id !== activeColumn.id) return col;

          const oldIndex = col.tasks.findIndex((t) => String(t.id) === activeId);
          const newIndex = col.tasks.findIndex((t) => String(t.id) === overId);

          if (oldIndex === -1 || newIndex === -1) return col;

          const newTasks = arrayMove(col.tasks, oldIndex, newIndex);
          const taskOrders = newTasks.map((t, index) => ({
            id: Number(t.id),
            position: index,
          }));

          reorderTasksAction(taskOrders, token);

          return { ...col, tasks: newTasks };
        });
      });
    }
  };

  const handleToggleCompletion = async (taskId: string) => {
    const id = String(taskId);
    const column = findColumn(id);
    if (!column) return;

    const task = column.tasks.find((t) => String(t.id) === id);
    if (!task) return;

    const newCompleted = !task.completed;
    await updateTaskAction(
      Number(id),
      undefined,
      undefined,
      token,
      newCompleted
    );

    // Move task to appropriate column
    setColumns((prev) => {
      const sourceColumn = prev.find((c) =>
        c.tasks.some((t) => String(t.id) === id)
      );
      if (!sourceColumn) return prev;

      const targetColumnId = newCompleted ? "completed" : "todo";

      return prev.map((col) => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => String(t.id) !== id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, { ...task, completed: newCompleted }],
          };
        }
        return col;
      });
    });

    onTasksChange?.();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 min-w-0">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            color={column.id === "todo" ? "#3B82F6" : "#22C55E"}
            onToggleCompletion={handleToggleCompletion}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={null}
        modifiers={[]}
        style={{ position: 'fixed', pointerEvents: 'none' }}
      >
        {activeTask && (
          <div className="w-64 opacity-90 shadow-xl rotate-2">
            <KanbanCard
              task={activeTask}
              onToggleCompletion={() => Promise.resolve()}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
