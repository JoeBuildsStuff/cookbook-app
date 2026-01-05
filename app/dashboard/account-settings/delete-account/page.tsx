import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deleteAccount, getCurrentUser } from "../actions"
import { redirect } from "next/navigation"

export default async function DeleteAccountPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Delete Account</h1>
        <p className="text-muted-foreground mt-1">
          Permanently delete your account and all associated data.
        </p>
      </div>

      {searchParams.error && searchParams.message && (
        <Alert variant="destructive">
          <AlertDescription>
            {decodeURIComponent(searchParams.message)}
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="destructive">
        <AlertDescription>
          <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
        </AlertDescription>
      </Alert>

      <form action={deleteAccount}>
        <FieldSet>
          <FieldLegend>Confirm Account Deletion</FieldLegend>
          <FieldDescription>
            To confirm, please type <strong>DELETE</strong> in the field below.
          </FieldDescription>
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="confirm_text">Confirmation</FieldLabel>
              <Input
                id="confirm_text"
                name="confirm_text"
                type="text"
                placeholder="Type DELETE to confirm"
                required
                autoComplete="off"
              />
              <FieldDescription>
                Type <strong>DELETE</strong> to confirm that you want to delete your account permanently.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button type="submit" variant="destructive">
            Delete My Account
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/dashboard/profile/delete-account">Cancel</a>
          </Button>
        </div>
      </form>
    </div>
  )
}

