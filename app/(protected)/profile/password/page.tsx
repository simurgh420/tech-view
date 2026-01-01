import { ChangePasswordForm } from '@/components/sections/auth/change-password-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PasswordSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  if (!session?.user) {
    return <div className="text-center text-gray-500">Not authenticated</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-8">
      <h1 className="text-2xl font-semibold">Change Password</h1>
      <p className="text-gray-500 text-sm">Update your account password.</p>

      <ChangePasswordForm />
    </div>
  );
}
