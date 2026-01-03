import type { Metadata } from "next";
import Logo from "@/components/ui/logo";
import { Bird } from "lucide-react";
import { AuthButton } from "@/components/auth-button";

export const metadata: Metadata = {
  title: "Marketing | A Web App",
  description: "Welcome to our web app",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex-1 overflow-auto px-4 grid grid-rows-[auto_1fr] "> 
    <header className="flex h-12 shrink-0 items-center gap-2">
      <div className="flex grow items-center gap-2 justify-between">
        <Logo icon={Bird} text="An App" />
        <div className="ml-auto">
            <AuthButton variant="icon" side="bottom" />
        </div>
      </div>
    </header>
    <div className="mb-4 overflow-auto">
      {children}
    </div>
  </main>
  );
}

