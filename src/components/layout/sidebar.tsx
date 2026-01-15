'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navigation = [
  { name: 'Хянах самбар', href: '/', icon: LayoutDashboard },
  { name: 'Дуудлагууд', href: '/tasks', icon: ClipboardList },
  { name: 'Инженерүүд', href: '/engineers', icon: Users },
  { name: 'Байгууллагууд', href: '/organizations', icon: Building2 },
  { name: 'Аналитик', href: '/analytics', icon: BarChart3 },
  { name: 'Тохиргоо', href: '/settings', icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">Digital Power</span>
          <span className="text-xs text-muted-foreground">Service Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Button */}
      <div className="px-4 pb-4">
        <Link href="/admin">
          <Button
            variant={pathname.startsWith('/admin') ? 'default' : 'outline'}
            className={cn(
              'w-full justify-start gap-3 font-semibold transition-all',
              pathname.startsWith('/admin') && 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg'
            )}
          >
            <Shield className="h-5 w-5" />
            Админ удирдлага
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">Digital Power Service</p>
          <p className="mt-1 text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-card lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
