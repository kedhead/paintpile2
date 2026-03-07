'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '../../components/nav-bar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGroupsRoute = pathname?.startsWith('/groups');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      {isGroupsRoute ? (
        children
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      )}
    </div>
  );
}
