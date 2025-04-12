"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "./register-form";

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");

  const handleSuccessfulRegistration = () => {
    setActiveTab("login");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm onRegistrationSuccess={handleSuccessfulRegistration} />
      </TabsContent>
    </Tabs>
  );
}
