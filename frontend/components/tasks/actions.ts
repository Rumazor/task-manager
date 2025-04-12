"use server";

import { BASE_API_URL } from "@/lib/exports";

export async function getTasksAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error al obtener tareas";
      throw new Error(errorMessage);
    }

    const data = await res.json();

    return {
      success: true,
      tasks: data,
    };
  } catch (error) {
    console.error("Get tasks error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function createTaskAction(
  title: string,
  description: string,
  completed: boolean = false,
  token: string
) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `,
      },
      body: JSON.stringify({
        title,
        description,
        completed,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error al crear tarea";
      throw new Error(errorMessage);
    }

    const data = await res.json();

    return {
      success: true,
      task: data,
    };
  } catch (error) {
    console.error("Create task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function updateTaskAction(
  id: number,
  title?: string,
  description?: string,
  token?: string,
  completed?: boolean
) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `,
      },
      body: JSON.stringify({ title, description, completed }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error al actualizar tarea";
      throw new Error(errorMessage);
    }

    const data = await res.json();

    return {
      success: true,
      task: data,
    };
  } catch (error) {
    console.error("Update task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteTaskAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token} `,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error al eliminar tarea";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: "Tarea eliminada exitosamente",
    };
  } catch (error) {
    console.error("Delete task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
