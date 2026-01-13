'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Wrench,
  Phone,
  Activity,
  ClipboardList,
  Settings,
  Home,
} from 'lucide-react';

const adminNav = [
  { name: 'Хянах самбар', href: '/admin', icon: Home },
  { name: 'Байгууллагууд', href: '/admin/organizations', icon: Building2 },
  { name: 'Барилгууд', href: '/admin/buildings', icon: Building2 },
  { name: 'Инженерүүд', href: '/admin/engineers', icon: Users },
  { name: 'Системийн төрлүүд', href: '/admin/system-types', icon: Wrench },
  { name: 'Дуудлагын төрлүүд', href: '/admin/call-types', icon: Phone },
  { name: 'Төлвүүд', href: '/admin/task-statuses', icon: Activity },
  { name: 'Дуудлагууд', href: '/admin/tasks', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Admin Sidebar */}
        <aside className="w-64 shrink-0 border-r bg-card">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Settings className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Админ</span>
          </div>
          <nav className="space-y-1 p-4">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-w-0">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-[1400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
