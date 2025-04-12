"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { loginAction } from "@/lib/auth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormularioDeInicioDeSesion() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formValidation = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Por favor, introduce un correo electrónico válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!formValidation()) {
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const response = await loginAction(formData.email, formData.password);

      if (response.success === true) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente.",
          variant: "default",
        });
        router.push("/dashboard");
      } else {
        const mensajeError = response.error || "Correo o contraseña inválidos.";
        setErrors((prev) => ({ ...prev, general: mensajeError }));
        toast({
          title: "Error al iniciar sesión",
          description: mensajeError,
          variant: "destructive",
        });
      }
    } catch (error) {
      const mensajeError =
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.";
      setErrors((prev) => ({ ...prev, general: mensajeError }));
      toast({
        title: "Error al iniciar sesión",
        description: mensajeError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Gestor de Tareas
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className={formSubmitted && errors.email ? "border-red-500" : ""}
            />
            {formSubmitted && errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className={
                formSubmitted && errors.password ? "border-red-500" : ""
              }
            />
            {formSubmitted && errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground"></CardFooter>
    </Card>
  );
}
