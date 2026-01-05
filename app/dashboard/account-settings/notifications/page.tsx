import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser } from "../actions"
import { redirect } from "next/navigation"
import { NotificationForm } from "./notification-form"

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; success?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  const preferences = user.notification_preferences || {
    email_notifications: true,
    marketing_emails: false,
    security_alerts: true,
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Manage your notification preferences and email settings.
        </p>
      </div>

      {searchParams.error && searchParams.message && (
        <Alert variant="destructive">
          <AlertDescription>
            {decodeURIComponent(searchParams.message)}
          </AlertDescription>
        </Alert>
      )}

      {searchParams.success && searchParams.message && (
        <Alert>
          <AlertDescription>
            {decodeURIComponent(searchParams.message)}
          </AlertDescription>
        </Alert>
      )}

      <NotificationForm initialPreferences={preferences} />
    </div>
  )
}

