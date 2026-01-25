import AuthTabs from "@/components/auth/auth-tabs";
import { ModeToggle } from "@/components/mode-toggle";
import { CheckCircle2 } from "lucide-react";

export default async function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-grid-pattern overflow-hidden">
      {/* Background gradients for a modern look */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-2xl mb-2">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            TaskFlow
          </h1>
          <p className="text-muted-foreground text-lg">
            Organiza tu día, alcanza tus metas.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <AuthTabs />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow Inc. Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}
