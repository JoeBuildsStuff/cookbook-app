import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser } from "../actions"
import { redirect } from "next/navigation"

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your billing information and payment methods.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Billing functionality is coming soon. This page is a placeholder for future payment integration.
        </AlertDescription>
      </Alert>

      <form>
        <FieldSet>
          <FieldLegend>Payment Information</FieldLegend>
          <FieldDescription>
            Manage your payment methods and billing address.
          </FieldDescription>
          
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="payment_method">Payment Method</FieldLabel>
              <Input
                id="payment_method"
                name="payment_method"
                type="text"
                placeholder="Add payment method"
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                Payment method management will be available soon.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="billing_address">Billing Address</FieldLabel>
              <Input
                id="billing_address"
                name="billing_address"
                type="text"
                placeholder="Enter billing address"
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                Update your billing address for invoices and receipts.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled>
            Save Changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/dashboard/profile/billing">Cancel</a>
          </Button>
        </div>
      </form>
    </div>
  )
}

