import { redirect } from 'next/navigation';

export default function AccountSettingsPage() {
  redirect('/dashboard/account-settings/profile');
  return null;
}
