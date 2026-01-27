"use server";

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { BASE_API_URL } from "./exports";

async function parseJsonResponse(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type");
  const text = await res.text();

  if (!text) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  return null;
}

function getErrorMessage(data: any, status: number): string {
  if (data?.message) {
    return Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
  }

  switch (status) {
    case 400:
      return "Datos inválidos";
    case 401:
      return "Credenciales incorrectas";
    case 404:
      return "Servicio no disponible";
    case 409:
      return "El usuario ya existe";
    case 500:
      return "Error interno del servidor";
    default:
      return `Error del servidor (${status})`;
  }
}

function handleFetchError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "No se puede conectar al servidor. Verifica que el backend esté corriendo.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Error desconocido";
}

export async function registerAction(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status));
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: handleFetchError(error),
    };
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status));
    }

    const token = data?.token;

    if (!token) {
      throw new Error("No se recibió un token válido del servidor");
    }

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      user: data,
      success: true,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: handleFetchError(error),
    };
  }
}

export async function logoutAction() {
  try {
    (await cookies()).delete("token");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
}

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function getUserFromCookie() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded) return null;

    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
