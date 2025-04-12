export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  created_by: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
