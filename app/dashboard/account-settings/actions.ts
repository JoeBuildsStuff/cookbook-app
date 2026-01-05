'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

// Profile update schema
const profileUpdateSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }).optional(),
  avatar_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
})

// Notification preferences schema
const notificationPreferencesSchema = z.object({
  email_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  security_alerts: z.boolean(),
})

// Billing schema (placeholder for future implementation)
const billingSchema = z.object({
  payment_method: z.string().optional(),
  billing_address: z.string().optional(),
})

export async function updateProfile(formData: FormData) {
  'use server'

  const supabase = await createClient()

  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    redirect('/signin')
  }

  const result = profileUpdateSchema.safeParse({
    full_name: formData.get('full_name'),
    avatar_url: formData.get('avatar_url'),
  })

  if (!result.success) {
    const errorMessages = result.error.issues.map((e) => e.message).join(', ')
    redirect(`/dashboard/profile?error=validation&message=${encodeURIComponent(errorMessages)}`)
  }

  // Update user metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      ...session.user.user_metadata,
      full_name: result.data.full_name || session.user.user_metadata.full_name,
      avatar_url: result.data.avatar_url || session.user.user_metadata.avatar_url,
    },
  })

  if (error) {
    redirect(`/dashboard/profile?error=update_error&message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/profile')
  redirect('/dashboard/profile?success=true&message=Profile updated successfully')
}

export async function updateNotificationPreferences(formData: FormData) {
  'use server'

  const supabase = await createClient()

  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    redirect('/signin')
  }

  const emailNotifications = formData.get('email_notifications')
  const marketingEmails = formData.get('marketing_emails')
  const securityAlerts = formData.get('security_alerts')

  const result = notificationPreferencesSchema.safeParse({
    email_notifications: emailNotifications === 'on' || emailNotifications === 'true',
    marketing_emails: marketingEmails === 'on' || marketingEmails === 'true',
    security_alerts: securityAlerts === 'on' || securityAlerts === 'true',
  })

  if (!result.success) {
    const errorMessages = result.error.issues.map((e) => e.message).join(', ')
    redirect(`/dashboard/profile/notifications?error=validation&message=${encodeURIComponent(errorMessages)}`)
  }

  // Update user metadata with notification preferences
  const { error } = await supabase.auth.updateUser({
    data: {
      ...session.user.user_metadata,
      notification_preferences: {
        email_notifications: result.data.email_notifications,
        marketing_emails: result.data.marketing_emails,
        security_alerts: result.data.security_alerts,
      },
    },
  })

  if (error) {
    redirect(`/dashboard/profile/notifications?error=update_error&message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/profile/notifications')
  redirect('/dashboard/profile/notifications?success=true&message=Notification preferences updated successfully')
}

export async function deleteAccount(formData: FormData) {
  'use server'

  const supabase = await createClient()

  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    redirect('/signin')
  }

  const confirmText = formData.get('confirm_text')
  const expectedText = 'DELETE'

  if (confirmText !== expectedText) {
    redirect(`/dashboard/profile/delete-account?error=confirmation&message=${encodeURIComponent('Confirmation text does not match')}`)
  }

  // Delete the user account
  // Note: This requires admin privileges or a custom function in Supabase
  // For now, we'll sign out the user. Actual account deletion should be handled via Supabase admin API or Edge Function
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect(`/dashboard/profile/delete-account?error=delete_error&message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  redirect('/signin?message=Account deletion requested. Please contact support if you need to complete the process.')
}

export async function getCurrentUser() {
  'use server'

  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || '',
    avatar_url: session.user.user_metadata?.avatar_url || '',
    created_at: session.user.created_at,
    notification_preferences: session.user.user_metadata?.notification_preferences || {
      email_notifications: true,
      marketing_emails: false,
      security_alerts: true,
    },
  }
}

