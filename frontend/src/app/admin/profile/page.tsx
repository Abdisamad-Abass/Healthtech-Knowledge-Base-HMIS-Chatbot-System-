'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get<UserProfile>('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="alert-danger rounded-2xl border px-6 py-5 text-center">
          <p className="font-medium">Failed to load profile.</p>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="mx-auto w-full max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-primary text-sm font-medium">Account management</p>
        <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">My profile</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage your administrator account and view your system access information.
        </p>
      </div>
      {/* Profile Hero */}
      <Card className="overflow-hidden rounded-3xl p-0">
        <div className="from-primary via-primary-hover to-chart-1 h-32 bg-gradient-to-r" />

        <div className="relative mt-5 px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="bg-primary text-primary-foreground flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white text-2xl font-bold shadow-lg">
                {initials}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-foreground text-2xl font-bold">{user.name}</h2>

                  <span className="badge badge-approved">
                    <ShieldCheck size={14} />
                    Administrator
                  </span>
                </div>

                <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
              </div>
            </div>

            <Button variant="outline" className="gap-2">
              <Edit3 size={16} />
              Edit profile
            </Button>
          </div>
        </div>
      </Card>
      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Account Information */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                <UserRound size={19} />
              </div>

              <div>
                <CardTitle>Account information</CardTitle>
                <CardDescription> Your personal and account details </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoItem icon={<UserRound size={17} />} label="Full Name" value={user.name} />

              <InfoItem icon={<Mail size={17} />} label="Email Address" value={user.email} />

              <InfoItem
                icon={<ShieldCheck size={17} />}
                label="Account Role"
                value="Administrator"
              />

              <InfoItem
                icon={<CheckCircle2 size={17} />}
                label="Account Status"
                value="Active"
                valueClass="text-green-600"
              />
              <InfoItem
                icon={<CalendarDays size={17} />}
                label="Joined"
                value={formatDate(user.createdAt)}
              />

              <InfoItem
                icon={<Clock3 size={17} />}
                label="Last Profile Updated"
                value={formatDate(user.updatedAt)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Overview */}
        <Card className="p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-info-bg text-info flex h-10 w-10 items-center justify-center rounded-xl">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="text-foreground font-semibold">Administrator Access</h2>
              <p className="text-muted-foreground text-sm">Your system permissions</p>
            </div>
          </div>

          <div className="space-y-3">
            <PermissionItem label="Manage Users" />
            <PermissionItem label="Manage Articles" />
            <PermissionItem label="Review Content" />
            <PermissionItem label="View Analytics" />
            <PermissionItem label="View Audit Logs" />
            <PermissionItem label="Manage System Settings" />
          </div>
        </Card>

        {/* Account Timeline */}
        <Card className="p-6 xl:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-success-bg text-success flex h-10 w-10 items-center justify-center rounded-xl">
              <Activity size={19} />
            </div>

            <div>
              <h2 className="text-foreground font-semibold">Account Activity</h2>

              <p className="text-muted-foreground text-sm">Important account dates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ActivityItem
              icon={<CalendarDays size={18} />}
              label="Account Created"
              value={formatDate(user.createdAt)}
            />

            <ActivityItem
              icon={<Clock3 size={18} />}
              label="Last Profile Update"
              value={formatDate(user.updatedAt)}
            />
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-warning-bg text-warning flex h-10 w-10 items-center justify-center rounded-xl">
              <UsersRound size={19} />
            </div>

            <div>
              <h2 className="text-foreground font-semibold">Quick Actions</h2>

              <p className="text-muted-foreground text-sm">Frequently used tools</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between text-left">
              <span>Change password</span>
              <span>→</span>
            </Button>

            <Button variant="outline" className="w-full justify-between text-left">
              <span>View Audit Logs</span>
              <span>→</span>
            </Button>

            <Button variant="outline" className="w-full justify-between text-left">
              <span>System Settings</span>
              <span>→</span>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClass = 'text-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="group border-border bg-primary/5 hover:border-primary/20 hover:bg-primary/10 rounded-2xl border p-5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>

          <p className={`text-foreground mt-1 text-sm font-semibold break-words ${valueClass}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ label }: { label: string }) {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-3 rounded-xl border px-3 py-2.5">
      <CheckCircle2 size={17} className="text-success shrink-0" />
      <span className="text-foreground text-sm">{label}</span>
    </div>
  );
}

function ActivityItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-4 rounded-xl border p-4">
      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
        {icon}
      </div>

      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground mt-1 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="mt-3 h-9 w-48 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="h-32 bg-gray-200" />

        <div className="p-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="h-24 w-24 rounded-3xl bg-gray-300" />

            <div>
              <div className="h-7 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-64 rounded-2xl bg-gray-200 xl:col-span-2" />
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-48 rounded-2xl bg-gray-200 xl:col-span-2" />
        <div className="h-48 rounded-2xl bg-gray-200" />
      </div>
    </main>
  );
}
