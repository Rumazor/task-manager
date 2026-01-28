"use server";

import { BASE_API_URL } from "@/lib/exports";
import type { TaskFilters, Tag } from "@/lib/types";

// Helper functions for error handling
async function parseJsonResponse(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type");
  const text = await res.text();

  if (!text) return null;

  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

function getErrorMessage(data: any, status: number, defaultMsg: string): string {
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }

  switch (status) {
    case 400: return "Datos inválidos";
    case 401: return "No autorizado";
    case 403: return "Acceso denegado";
    case 404: return "No encontrado";
    case 500: return "Error interno del servidor";
    default: return defaultMsg;
  }
}

function handleFetchError(error: unknown, defaultMsg: string): string {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "No se puede conectar al servidor";
  }
  return error instanceof Error ? error.message : defaultMsg;
}

export async function getTasksAction(token: string, filters?: TaskFilters) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tagId) params.append('tagId', filters.tagId.toString());
      if (filters.dueBefore) params.append('dueBefore', filters.dueBefore);
      if (filters.dueAfter) params.append('dueAfter', filters.dueAfter);
      if (filters.completed !== undefined) params.append('completed', filters.completed.toString());
      if (filters.search) params.append('search', filters.search);
    }

    const url = `${BASE_API_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener tareas"));
    }

    return { success: true, tasks: data };
  } catch (error) {
    console.error("Get tasks error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener tareas") };
  }
}

export async function getUsersAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, 'Error al obtener usuarios'));
    }

    return { success: true, users: data };
  } catch (error) {
    console.error('Get users error:', error);
    return { success: false, error: handleFetchError(error, 'Error al obtener usuarios') };
  }
}

export async function createTaskAction(
  title: string,
  description: string,
  completed: boolean = false,
  token: string,
  assignedToId?: string,
  dueDate?: string,
  priority?: 'low' | 'medium' | 'high',
  tagIds?: number[],
  parentTaskId?: number
) {
  try {
    const body: any = { title, description, completed };

    if (assignedToId) body.assignedToId = assignedToId;
    if (dueDate) body.dueDate = dueDate;
    if (priority) body.priority = priority;
    if (tagIds && tagIds.length > 0) body.tagIds = tagIds;
    if (parentTaskId) body.parentTaskId = parentTaskId;

    const res = await fetch(`${BASE_API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al crear tarea"));
    }

    return { success: true, task: data };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, error: handleFetchError(error, "Error al crear tarea") };
  }
}

export async function updateTaskAction(
  id: number,
  title?: string,
  description?: string,
  token?: string,
  completed?: boolean,
  assignedToId?: string,
  dueDate?: string,
  priority?: 'low' | 'medium' | 'high',
  tagIds?: number[],
  parentTaskId?: number
) {
  try {
    const body: any = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (completed !== undefined) body.completed = completed;
    if (assignedToId !== undefined) body.assignedToId = assignedToId;
    if (dueDate !== undefined) body.dueDate = dueDate;
    if (priority !== undefined) body.priority = priority;
    if (tagIds !== undefined) body.tagIds = tagIds;
    if (parentTaskId !== undefined) body.parentTaskId = parentTaskId;

    const res = await fetch(`${BASE_API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al actualizar tarea"));
    }

    return { success: true, task: data };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, error: handleFetchError(error, "Error al actualizar tarea") };
  }
}

export async function deleteTaskAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al eliminar tarea"));
    }

    return { success: true, message: "Tarea eliminada exitosamente" };
  } catch (error) {
    console.error("Delete task error:", error);
    return { success: false, error: handleFetchError(error, "Error al eliminar tarea") };
  }
}

// Tag actions
export async function getTagsAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener etiquetas"));
    }

    return { success: true, tags: data as Tag[] };
  } catch (error) {
    console.error("Get tags error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener etiquetas") };
  }
}

export async function createTagAction(name: string, color: string, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, color }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al crear etiqueta"));
    }

    return { success: true, tag: data as Tag };
  } catch (error) {
    console.error("Create tag error:", error);
    return { success: false, error: handleFetchError(error, "Error al crear etiqueta") };
  }
}

export async function deleteTagAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/tags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al eliminar etiqueta"));
    }

    return { success: true, message: "Etiqueta eliminada exitosamente" };
  } catch (error) {
    console.error("Delete tag error:", error);
    return { success: false, error: handleFetchError(error, "Error al eliminar etiqueta") };
  }
}

export async function reorderTasksAction(
  taskOrders: { id: number; position: number }[],
  token: string
) {
  try {
    const res = await fetch(`${BASE_API_URL}/tasks/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskOrders),
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al reordenar tareas"));
    }

    return { success: true, message: "Tareas reordenadas exitosamente" };
  } catch (error) {
    console.error("Reorder tasks error:", error);
    return { success: false, error: handleFetchError(error, "Error al reordenar tareas") };
  }
}

// Project actions
export async function getProjectsAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener proyectos"));
    }

    return { success: true, projects: data };
  } catch (error) {
    console.error("Get projects error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener proyectos") };
  }
}

export async function getProjectAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/projects/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener proyecto"));
    }

    return { success: true, project: data };
  } catch (error) {
    console.error("Get project error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener proyecto") };
  }
}

export async function getProjectTasksAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/projects/${id}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener tareas del proyecto"));
    }

    return { success: true, tasks: data };
  } catch (error) {
    console.error("Get project tasks error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener tareas del proyecto") };
  }
}

export async function createProjectAction(
  name: string,
  description: string,
  color: string,
  token: string
) {
  try {
    const res = await fetch(`${BASE_API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, color }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al crear proyecto"));
    }

    return { success: true, project: data };
  } catch (error) {
    console.error("Create project error:", error);
    return { success: false, error: handleFetchError(error, "Error al crear proyecto") };
  }
}

export async function updateProjectAction(
  id: number,
  name?: string,
  description?: string,
  color?: string,
  token?: string
) {
  try {
    const body: any = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (color !== undefined) body.color = color;

    const res = await fetch(`${BASE_API_URL}/projects/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al actualizar proyecto"));
    }

    return { success: true, project: data };
  } catch (error) {
    console.error("Update project error:", error);
    return { success: false, error: handleFetchError(error, "Error al actualizar proyecto") };
  }
}

export async function deleteProjectAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al eliminar proyecto"));
    }

    return { success: true, message: "Proyecto eliminado exitosamente" };
  } catch (error) {
    console.error("Delete project error:", error);
    return { success: false, error: handleFetchError(error, "Error al eliminar proyecto") };
  }
}

// Comment actions
export async function getCommentsAction(taskId: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/comments/task/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener comentarios"));
    }

    return { success: true, comments: data };
  } catch (error) {
    console.error("Get comments error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener comentarios") };
  }
}

export async function createCommentAction(taskId: number, content: string, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskId, content }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al crear comentario"));
    }

    return { success: true, comment: data };
  } catch (error) {
    console.error("Create comment error:", error);
    return { success: false, error: handleFetchError(error, "Error al crear comentario") };
  }
}

export async function deleteCommentAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al eliminar comentario"));
    }

    return { success: true, message: "Comentario eliminado exitosamente" };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: handleFetchError(error, "Error al eliminar comentario") };
  }
}

// Notification actions
export async function getNotificationsAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener notificaciones"));
    }

    return { success: true, notifications: data };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener notificaciones") };
  }
}

export async function getUnreadNotificationCountAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/notifications/count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { success: true, count: 0 };
    }

    const data = await parseJsonResponse(res);
    return { success: true, count: data?.count ?? 0 };
  } catch (error) {
    console.error("Get notification count error:", error);
    return { success: true, count: 0 };
  }
}

export async function markNotificationAsReadAction(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al marcar notificacion"));
    }

    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: handleFetchError(error, "Error al marcar notificacion") };
  }
}

export async function markAllNotificationsAsReadAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await parseJsonResponse(res);
      throw new Error(getErrorMessage(data, res.status, "Error al marcar notificaciones"));
    }

    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: handleFetchError(error, "Error al marcar notificaciones") };
  }
}

// Activity actions
export async function getActivityAction(token: string, limit?: number) {
  try {
    const url = limit
      ? `${BASE_API_URL}/activity?limit=${limit}`
      : `${BASE_API_URL}/activity`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener actividad"));
    }

    return { success: true, activities: data };
  } catch (error) {
    console.error("Get activity error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener actividad") };
  }
}

export async function getTaskActivityAction(taskId: number, token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/activity/task/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener actividad"));
    }

    return { success: true, activities: data };
  } catch (error) {
    console.error("Get task activity error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener actividad") };
  }
}

// Stats actions
export async function getStatsOverviewAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/stats/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener estadisticas"));
    }

    return { success: true, stats: data };
  } catch (error) {
    console.error("Get stats overview error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener estadisticas") };
  }
}

export async function getStatsByPriorityAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/stats/by-priority`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener estadisticas"));
    }

    return { success: true, stats: data };
  } catch (error) {
    console.error("Get stats by priority error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener estadisticas") };
  }
}

export async function getStatsByProjectAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/stats/by-project`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener estadisticas"));
    }

    return { success: true, stats: data };
  } catch (error) {
    console.error("Get stats by project error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener estadisticas") };
  }
}

export async function getWeeklyStatsAction(token: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/stats/weekly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener estadisticas"));
    }

    return { success: true, stats: data };
  } catch (error) {
    console.error("Get weekly stats error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener estadisticas") };
  }
}

export async function getCalendarTasksAction(
  token: string,
  startDate: string,
  endDate: string
) {
  try {
    const res = await fetch(
      `${BASE_API_URL}/stats/calendar?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status, "Error al obtener tareas del calendario"));
    }

    return { success: true, tasks: data };
  } catch (error) {
    console.error("Get calendar tasks error:", error);
    return { success: false, error: handleFetchError(error, "Error al obtener tareas del calendario") };
  }
}
