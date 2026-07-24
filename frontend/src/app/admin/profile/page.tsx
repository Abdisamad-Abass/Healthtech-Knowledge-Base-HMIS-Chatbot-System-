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
        {' '}
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">
          {' '}
          <p className="font-medium text-red-600">Failed to load profile.</p>{' '}
        </div>{' '}
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
      {/* Page Header */}{' '}
      <div className="mb-8">
        {' '}
        <p className="text-sm font-medium text-[#0F52BA]">Account Management</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your administrator account and view your system access information.
        </p>
      </div>
      {/* Profile Hero */}
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#0F52BA] via-[#2563EB] to-[#82AEF0]" />

        <div className="relative mt-3 px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-[#0F52BA] text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#0F52BA]">
                    <ShieldCheck size={14} />
                    Administrator
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Account Information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#0F52BA]">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Account Information</h2>

              <p className="text-sm text-gray-500">Your basic account details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem icon={<UserRound size={17} />} label="Full Name" value={user.name} />

            <InfoItem icon={<Mail size={17} />} label="Email Address" value={user.email} />

            <InfoItem icon={<ShieldCheck size={17} />} label="Account Role" value="Administrator" />

            <InfoItem
              icon={<CheckCircle2 size={17} />}
              label="Account Status"
              value="Active"
              valueClass="text-green-600"
            />
          </div>
        </section>

        {/* Role Overview */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Administrator Access</h2>

              <p className="text-sm text-gray-500">Your system permissions</p>
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
        </section>

        {/* Account Timeline */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Activity size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Account Activity</h2>

              <p className="text-sm text-gray-500">Important account dates</p>
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
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <UsersRound size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>

              <p className="text-sm text-gray-500">Frequently used tools</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0F52BA]">
              <span>Change Password</span>
              <span>→</span>
            </button>

            <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0F52BA]">
              <span>View Audit Logs</span>
              <span>→</span>
            </button>

            <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0F52BA]">
              <span>System Settings</span>
              <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClass = 'text-gray-900',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      {' '}
      <div className="flex items-center gap-2 text-gray-500">
        {icon} <span className="text-xs font-medium">{label}</span>{' '}
      </div>
      <p className={`mt-2 text-sm font-semibold break-all ${valueClass}`}>{value}</p>
    </div>
  );
}

function PermissionItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
      {' '}
      <CheckCircle2 size={17} className="shrink-0 text-green-500" />{' '}
      <span className="text-sm text-gray-700">{label}</span>{' '}
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
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      {' '}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0F52BA] shadow-sm">
        {icon}{' '}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
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
      {' '}
      <div className="mb-8">
        {' '}
        <div className="h-4 w-32 rounded bg-gray-200" />{' '}
        <div className="mt-3 h-9 w-48 rounded bg-gray-200" />{' '}
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />{' '}
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
