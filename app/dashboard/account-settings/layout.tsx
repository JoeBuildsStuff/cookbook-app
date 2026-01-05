import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountSettingsSidebar } from "./account-settings-sidebar"

export default async function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin')
  }

  // This layout renders inside the dashboard layout's main content area
  // The main AppSidebar remains visible on the far left
  // This creates a nested sidebar structure: [Main Sidebar] [Profile Sidebar] [Content]
  return (
    <div className="flex w-full h-full rounded-lg border  border-border">
      <AccountSettingsSidebar />
      <div className="flex-1 min-w-0 p-4">
        {children}
      </div>
    </div>
  )
}

