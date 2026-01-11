import Logo from "@/components/ui/logo";
import { Bird } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { Button } from "../ui/button";
import GithubIconIcon from "../icons/github";

export function HomeHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2">
      <div className="flex grow items-center gap-2 justify-between">
        <Logo icon={Bird} text="An App" />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/JoeBuildsStuff/tech-stack-010226"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View project on GitHub"
            >
              <GithubIconIcon className="size-5" />
            </a>
          </Button>
          <AuthButton variant="icon" side="bottom" />
        </div>
      </div>
    </header>
  );
}
