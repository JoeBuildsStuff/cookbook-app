import { ChefHat } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <header className="flex flex-col items-center justify-center mb-4">
        <ChefHat className="size-10 shrink-0" />
        <h1 className="text-2xl font-bold">AI Cookbook App</h1>
        <p className="text-sm text-muted-foreground">Create recipes with AI.</p>
      </header>
      {children}
    </main>
  );
}
