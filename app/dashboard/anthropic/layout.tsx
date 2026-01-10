import { AnthropicSidebar } from "./_components/anthropic-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AnthropicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout renders inside the dashboard layout's main content area
  // The main AppSidebar remains visible on the far left
  // This creates a nested sidebar structure: [Main Sidebar] [Anthropic Sidebar] [Content]
  // We wrap AnthropicSidebar in its own SidebarProvider so it has independent state
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-[calc(100vh-56px)] rounded-lg border border-border bg-[#FAF9F5] dark:bg-[#262624]">
        <AnthropicSidebar />

        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}
