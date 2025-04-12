"use client";

import type { Task } from "@/lib/types";

let mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the new feature",
    completed: false,
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Review pull requests",
    description: "Review and approve team members' pull requests",
    completed: true,
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Prepare for weekly meeting",
    description: "Create slides and gather metrics for the weekly team meeting",
    completed: false,
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchTasks(): Promise<Task[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockTasks];
}

export async function createTask(
  title: string,
  description: string
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newTask: Task = {
    id: Date.now().toString(),
    title,
    description,
    completed: false,
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log("Creating new task:", newTask);

  mockTasks = [...mockTasks, newTask];
  return newTask;
}

export async function updateTask(
  id: string,
  title: string,
  description: string
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const taskIndex = mockTasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error("Task not found");
  }

  const updatedTask = {
    ...mockTasks[taskIndex],
    title,
    description,
    updatedAt: new Date().toISOString(),
  };

  mockTasks = mockTasks.map((task) => (task.id === id ? updatedTask : task));
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockTasks = mockTasks.filter((task) => task.id !== id);
}

export async function toggleTaskCompletion(
  id: string,
  completed: boolean
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const taskIndex = mockTasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error("Task not found");
  }

  const updatedTask = {
    ...mockTasks[taskIndex],
    completed,
    updatedAt: new Date().toISOString(),
  };

  mockTasks = mockTasks.map((task) => (task.id === id ? updatedTask : task));
  return updatedTask;
}
