import { LucideIcon } from "lucide-react";

export interface LogoProps {
  /** The Lucide icon component to display */
  icon: LucideIcon;
  /** The text to display next to the icon */
  text: string;
}

export default function Logo({ icon: Icon, text }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-foreground text-background dark:bg-secondary dark:text-foreground rounded-lg">
        <Icon className="size-5" />
      </div>
      <span className="hidden sm:block">{text}</span>
    </div>
  )
}