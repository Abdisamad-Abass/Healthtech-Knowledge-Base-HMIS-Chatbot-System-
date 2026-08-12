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
  User,
  UserRound,
} from 'lucide-react';

import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export default function EditorProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get<UserProfile>('/auth/me');

      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileLoading />;
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error || 'Profile not found'}</p>

            <button
              onClick={fetchProfile}
              className="mt-4 rounded-xl bg-[#0F52BA] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const lastUpdated = new Date(profile.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen">
      <div>
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-primary text-2xl font-bold">My profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your editor account and view your account information.
            </p>
          </div>

          <Button variant="outline">
            <Edit3 className="mr-2 size-4" /> Edit profile
          </Button>
        </div>

        {/* PROFILE HERO */}
        <Card className="overflow-hidden">
          {/* COVER */}
          <div className="from-primary h-32 bg-gradient-to-r via-blue-600 to-cyan-500" />
          {/* PROFILE INFO */}
          <CardContent className="mt-7 px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* AVATAR */}
                <div className="border-background bg-primary text-primary-foreground flex size-24 items-center justify-center rounded-2xl border-4 text-2xl font-bold shadow-lg">
                  {initials}
                </div>

                <div className="pb-1">
                  <h2 className="text-foreground text-2xl font-bold">{profile.name}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="badge badge-role-editor">
                      <ShieldCheck className="size-3.5" /> Editor
                    </span>

                    <span className="badge badge-published">
                      <span className="badge-dot" /> Active account
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarDays className="size-4" /> <span>Member since {memberSince}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account information card */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ACCOUNT INFORMATION */}
          <Card className="lg:col-span-2">
            <div className="border-l-primary animate-fade-in-up rounded-2xl delay-150">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Account information</CardTitle>
                    <CardDescription> Your personal and account details </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileInfo
                    icon={<User className="size-4" />}
                    label="Full name"
                    value={profile.name}
                  />
                  <ProfileInfo
                    icon={<Mail className="size-4" />}
                    label="Email address"
                    value={profile.email}
                  />
                  <ProfileInfo
                    icon={<ShieldCheck className="size-4" />}
                    label="Account role"
                    value="Editor"
                  />
                  <ProfileInfo
                    icon={<CheckCircle2 className="size-4" />}
                    label="Account status"
                    value="Active"
                    valueClassName="text-success"
                  />
                  <ProfileInfo
                    icon={<CalendarDays className="size-4" />}
                    label="Joined"
                    value={new Date(profile.createdAt).toLocaleDateString()}
                  />
                  <ProfileInfo
                    icon={<Clock3 className="size-4" />}
                    label="Last profile update"
                    value={lastUpdated}
                  />
                </div>
              </CardContent>
            </div>
          </Card>

          {/* ROLE & Permission CARD */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <CardTitle>Editor access</CardTitle>
                    <CardDescription> Your workspace permissions </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <PermissionItem label="Create Articles" allowed />

                <PermissionItem label="Edit Articles" allowed />

                <PermissionItem label="Submit Articles for Review" allowed />

                <PermissionItem label="View Knowledge Base Analytics" allowed />

                <PermissionItem label="Manage System Users" allowed={false} />
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ACCOUNT OVERVIEW */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-foreground text-lg font-semibold">Account Overview</h2>

            <p className="text-muted-foreground mt-1 text-sm">
              A quick overview of your activity in the knowledge base.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="Account Status"
              value="Active"
              icon={<CheckCircle2 size={19} />}
              iconClass="bg-success-bg text-success"
              valueClassName="text-success"
            />

            <OverviewCard
              label="Workspace"
              value="Editor"
              icon={<ShieldCheck size={19} />}
              iconClass="bg-primary/10 text-primary"
            />

            <OverviewCard
              label="Member Since"
              value={memberSince}
              icon={<CalendarDays size={19} />}
              iconClass="bg-info-bg text-info"
            />

            <OverviewCard
              label="Profile"
              value="Complete"
              icon={<Activity size={19} />}
              iconClass="bg-warning-bg text-warning"
            />
          </div>
        </section>

        {/* SECURITY NOTICE */}
        <section className="alert-info animate-fade-in-up mt-5 rounded-2xl border p-5 delay-450">
          <div className="flex gap-4">
            <div className="bg-info-bg text-info flex size-10 items-center justify-center rounded-xl">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <h3 className="text-foreground font-semibold"> Keep your account secure </h3>

              <p className="text-muted-foreground mt-1 text-sm leading-6">
                Never share your password or authentication details with anyone. If you believe your
                account has been compromised, contact the system administrator immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* PROFILE INFO */

function ProfileInfo({
  icon,
  label,
  value,
  valueClassName = 'text-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
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

          <p className={`text-foreground mt-1 text-sm font-semibold break-words ${valueClassName}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* PERMISSION ITEM */

function PermissionItem({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="border-border bg-muted/30 flex items-center justify-between rounded-xl border px-3 py-3">
      <span className="text-foreground text-sm">{label}</span>

      {allowed ? (
        <CheckCircle2 size={17} className="text-success" />
      ) : (
        <span className="text-muted-foreground text-xs font-medium">Restricted</span>
      )}
    </div>
  );
}

/* OVERVIEW CARD */
function OverviewCard({
  label,
  value,
  icon,
  iconClass,
  valueClassName = 'text-foreground',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClassName?: string;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>

          <p className={`mt-2 text-lg font-bold ${valueClassName}`}>{value}</p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* LOADING */

function ProfileLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mb-6">
          <div className="bg-primary/10 h-6 w-40 rounded" />
          <div className="bg-primary/30 mt-2 h-4 w-80 rounded" />
        </div>

        <div className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="bg-primary/10 h-40" />

          <div className="px-8 pb-6">
            <div className="-mt-14 flex items-end gap-4">
              <div className="bg-primary/30 h-28 w-28 rounded-2xl" />

              <div className="pb-2">
                <div className="bg-primary/10 h-6 w-48 rounded" />
                <div className="bg-primary/10 mt-3 h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-primary/10 h-80 rounded-2xl lg:col-span-2" />
          <div className="bg-primary/10 h-80 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
