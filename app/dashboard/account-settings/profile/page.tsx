import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, updateProfile } from "../actions"
import { redirect } from "next/navigation"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; success?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and preferences.
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

      <form action={updateProfile}>
        <FieldSet>
          <FieldLegend>Account Information</FieldLegend>
          <FieldDescription>
            Update your profile information. This information is visible to you only.
          </FieldDescription>
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ''}
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                Your email address cannot be changed. Contact support if you need to update it.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={user.full_name || ''}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              <FieldDescription>
                This is your display name. It will be visible in your profile.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="avatar_url">Avatar URL</FieldLabel>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                defaultValue={user.avatar_url || ''}
                placeholder="https://example.com/avatar.jpg"
                autoComplete="photo"
              />
              <FieldDescription>
                URL to your profile picture. Leave empty to use the default avatar.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="created_at">Account Created</FieldLabel>
              <Input
                id="created_at"
                name="created_at"
                type="text"
                defaultValue={user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                The date when your account was created.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <a href="/dashboard/profile">Cancel</a>
          </Button>
        </div>
      </form>
    </div>
  )
}

