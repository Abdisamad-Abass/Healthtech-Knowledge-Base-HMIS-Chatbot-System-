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
      <div className="mx-auto w-full max-w-6xl">
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-[#0F52BA]">My Profile</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your editor account and view your account information.
            </p>
          </div>

          <button className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>

        {/* PROFILE HERO */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* COVER */}
          <div className="h-28 bg-gradient-to-r from-[#0F52BA] via-blue-600 to-blue-400 sm:h-40" />

          {/* PROFILE INFO */}
          <div className="mt-2 px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* AVATAR */}
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-2xl font-bold text-[#0F52BA] shadow-md sm:h-28 sm:w-28">
                  {initials}
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#0F52BA]">
                      <ShieldCheck size={14} />
                      Editor
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Active Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />

                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE CONTENT */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ACCOUNT INFORMATION */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#0F52BA]">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-800">Account Information</h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Your personal and account details
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                <ProfileInfo icon={<User size={17} />} label="Full Name" value={profile.name} />

                <ProfileInfo
                  icon={<Mail size={17} />}
                  label="Email Address"
                  value={profile.email}
                />

                <ProfileInfo icon={<ShieldCheck size={17} />} label="Account Role" value="Editor" />

                <ProfileInfo
                  icon={<CheckCircle2 size={17} />}
                  label="Account Status"
                  value="Active"
                  valueClassName="text-green-600"
                />

                <ProfileInfo
                  icon={<CalendarDays size={17} />}
                  label="Joined"
                  value={new Date(profile.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />

                <ProfileInfo
                  icon={<Clock3 size={17} />}
                  label="Last Profile Update"
                  value={lastUpdated}
                />
              </div>
            </div>
          </section>

          {/* ROLE CARD */}
          <section>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">Editor Access</h2>

                  <p className="mt-0.5 text-xs text-gray-500">Your workspace permissions</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <PermissionItem label="Create Articles" allowed />

                <PermissionItem label="Edit Articles" allowed />

                <PermissionItem label="Submit Articles for Review" allowed />

                <PermissionItem label="View Knowledge Base Analytics" allowed />

                <PermissionItem label="Manage System Users" allowed={false} />
              </div>
            </div>
          </section>
        </div>

        {/* ACCOUNT OVERVIEW */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Account Overview</h2>

            <p className="mt-1 text-sm text-gray-500">
              A quick overview of your activity in the knowledge base.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="Account Status"
              value="Active"
              icon={<CheckCircle2 size={19} />}
              iconClass="bg-green-100 text-green-600"
              valueClassName="text-green-600"
            />

            <OverviewCard
              label="Workspace"
              value="Editor"
              icon={<ShieldCheck size={19} />}
              iconClass="bg-blue-100 text-[#0F52BA]"
            />

            <OverviewCard
              label="Member Since"
              value={memberSince}
              icon={<CalendarDays size={19} />}
              iconClass="bg-purple-100 text-purple-600"
            />

            <OverviewCard
              label="Profile"
              value="Complete"
              icon={<Activity size={19} />}
              iconClass="bg-orange-100 text-orange-600"
            />
          </div>
        </section>

        {/* SECURITY NOTICE */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#0F52BA]">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Keep your account secure</h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
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
  valueClassName = 'text-gray-800',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className={`mt-2 text-sm font-semibold break-words ${valueClassName}`}>{value}</p>
    </div>
  );
}

/* PERMISSION ITEM */

function PermissionItem({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
      <span className="text-sm text-gray-700">{label}</span>

      {allowed ? (
        <CheckCircle2 size={17} className="text-green-600" />
      ) : (
        <span className="text-xs font-medium text-gray-400">Restricted</span>
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
  valueClassName = 'text-gray-800',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>

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
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-200" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="h-40 bg-gray-200" />

          <div className="px-8 pb-6">
            <div className="-mt-14 flex items-end gap-4">
              <div className="h-28 w-28 rounded-2xl bg-gray-300" />

              <div className="pb-2">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="mt-3 h-6 w-28 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-2xl bg-gray-200 lg:col-span-2" />
          <div className="h-80 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
