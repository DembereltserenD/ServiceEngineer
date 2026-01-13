'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wrench, Phone, Activity, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const adminCards = [
  { title: 'Байгууллагууд', icon: Building2, href: '/admin/organizations', color: 'text-blue-500' },
  { title: 'Барилгууд', icon: Building2, href: '/admin/buildings', color: 'text-green-500' },
  { title: 'Инженерүүд', icon: Users, href: '/admin/engineers', color: 'text-purple-500' },
  { title: 'Системийн төрлүүд', icon: Wrench, href: '/admin/system-types', color: 'text-orange-500' },
  { title: 'Дуудлагын төрлүүд', icon: Phone, href: '/admin/call-types', color: 'text-cyan-500' },
  { title: 'Төлвүүд', icon: Activity, href: '/admin/task-statuses', color: 'text-pink-500' },
  { title: 'Дуудлагууд', icon: ClipboardList, href: '/admin/tasks', color: 'text-indigo-500' },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Админ удирдлага</h1>
        <p className="text-muted-foreground">Системийн өгөгдөл удирдах</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-all hover:shadow-lg hover:border-primary cursor-pointer">
              <CardHeader>
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <CardTitle className="mt-2">{card.title}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
