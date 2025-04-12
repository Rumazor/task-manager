"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { BASE_API_URL } from "./exports";

export async function registerAction(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error desconocido";
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al registrar usuario",
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

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "Error desconocido";
      throw new Error(errorMessage);
    }

    const data = await res.json();
    const token = data.token;

    if (!token) {
      throw new Error("No se recibió un token válido del servidor");
    }

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
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
      error: error instanceof Error ? error.message : "Error al loguear",
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

export async function getUserFromCookie() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return null;
    }

    const decoded: any = jwt.decode(token);
    if (!decoded) return null;

    return {
      id: decoded.id,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
