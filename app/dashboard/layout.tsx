import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/ui/dynamic-breadcrumbs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommandSearch from "@/components/dashboard/command-search";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to signin if not authenticated
  // Include the dashboard path as 'next' parameter for redirect after login
  if (!session) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto px-4 h-100dvh">
        <header className="flex h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex grow items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <DynamicBreadcrumbs />
          </div>
          <CommandSearch groups={[]} />
        </header>
        <div className="mb-4 overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
