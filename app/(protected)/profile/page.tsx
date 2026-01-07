import { UpdateUserForm } from '@/components/sections/auth/update-user-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!session?.user) {
    return <div className="text-center ">Not authenticated</div>;
  }

  const { name, image } = session.user;

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-8">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <UpdateUserForm name={name ?? ''} image={image ?? ''} />
    </div>
  );
}
