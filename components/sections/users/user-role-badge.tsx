export function UserRoleBadge({ role }: { role?: string }) {
  const isAdmin = role === 'ADMIN' || role === 'admin';

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium
      ${isAdmin ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
    >
      <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-600' : 'bg-amber-700'}`} />
      <span className="hidden sm:inline">{isAdmin ? 'مدیر' : 'کاربر'}</span>
    </span>
  );
}
