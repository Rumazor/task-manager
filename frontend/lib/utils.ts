import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Fecha desconocida";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return "Error en formato de fecha";
  }
};
