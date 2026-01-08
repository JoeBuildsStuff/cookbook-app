import { AnthropicSidebar } from "./_components/anthropic-sidebar";

export default function AnthropicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout renders inside the dashboard layout's main content area
  // The main AppSidebar remains visible on the far left
  // This creates a nested sidebar structure: [Main Sidebar] [Anthropic Sidebar] [Content]
  return (
    <div className="flex w-full h-[calc(100vh-56px)] rounded-lg border border-border ">
      <AnthropicSidebar />
      <div className="flex-1 min-w-0 p-4 h-full">{children}</div>
    </div>
  );
}
