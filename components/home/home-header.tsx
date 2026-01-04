import Logo from "@/components/ui/logo";
import { Bird } from "lucide-react";
import { AuthButton } from "@/components/auth-button";

export function HomeHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2">
      <div className="flex grow items-center gap-2 justify-between">
        <Logo icon={Bird} text="An App" />
        <div className="ml-auto">
          <AuthButton variant="icon" side="bottom" />
        </div>
      </div>
    </header>
  );
}

