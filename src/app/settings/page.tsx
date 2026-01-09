'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Bell, Database, Shield, Globe, Save, RefreshCw, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout title="Тохиргоо">
      <div className="max-w-4xl space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Профайл</CardTitle>
                <CardDescription>Хэрэглэгчийн мэдээллийг засах</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Нэр</label>
                <Input defaultValue="Админ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">И-мэйл</label>
                <Input type="email" defaultValue="admin@digitalpower.mn" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="success">
                <Save className="h-4 w-4" />
                Хадгалах
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Мэдэгдэл</CardTitle>
                <CardDescription>Мэдэгдлийн тохиргоо</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Шинэ дуудлагын мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">
                  Шинэ дуудлага ирэхэд мэдэгдэл хүлээн авах
                </p>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  <SelectItem value="important">Чухал</SelectItem>
                  <SelectItem value="none">Хүлээн авахгүй</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">И-мэйл мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">
                  Өдөр бүрийн тайланг и-мэйлээр хүлээн авах
                </p>
              </div>
              <Select defaultValue="daily">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Өдөр бүр</SelectItem>
                  <SelectItem value="weekly">7 хоног бүр</SelectItem>
                  <SelectItem value="monthly">Сар бүр</SelectItem>
                  <SelectItem value="none">Хүлээн авахгүй</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Хэл</CardTitle>
                <CardDescription>Интерфэйсийн хэлийг сонгох</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select defaultValue="mn">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mn">Монгол</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Өгөгдлийн сан</CardTitle>
                <CardDescription>Supabase холболтын тохиргоо</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supabase URL</label>
              <Input placeholder="https://xxxxx.supabase.co" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Anon Key</label>
              <Input type="password" placeholder="••••••••••••••••" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Холболт шалгах
              </Button>
              <Button variant="success">
                <Save className="h-4 w-4" />
                Хадгалах
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle>Аюулгүй байдал</CardTitle>
                <CardDescription>Нууц үг болон аюулгүй байдлын тохиргоо</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Одоогийн нууц үг</label>
                <Input type="password" />
              </div>
              <div></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Шинэ нууц үг</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Шинэ нууц үг давтах</label>
                <Input type="password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="warning">
                <Key className="h-4 w-4" />
                Нууц үг солих
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
