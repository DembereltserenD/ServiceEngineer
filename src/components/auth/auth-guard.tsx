'use client';

import { usePathname } from 'next/navigation';
import { ProtectedRoute } from './protected-route';

const publicPaths = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Allow access to public paths without authentication
  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // Protect all other paths
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
