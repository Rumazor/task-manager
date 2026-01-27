export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  created_by: string;
  user_id: string;
  assignedTo?: User;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: Tag[];
  subtasks?: Subtask[];
  parentTaskId?: number;
  position?: number;
  projectId?: number;
  project?: {
    id: number;
    name: string;
    color: string;
  };
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TaskFilters {
  priority?: 'low' | 'medium' | 'high';
  tagId?: number;
  dueBefore?: string;
  dueAfter?: string;
  completed?: boolean;
  search?: string;
  projectId?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}
