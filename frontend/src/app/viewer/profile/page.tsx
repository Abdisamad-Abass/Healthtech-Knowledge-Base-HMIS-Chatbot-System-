'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Calendar, RefreshCw, Edit } from 'lucide-react';

import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ViewerProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);

      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'V';

  function formatDate(date?: string) {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" className="w-fit px-0" onClick={() => router.push('/viewer')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>

            <h1 className="text-foreground text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              View your account information and profile details.
            </p>
          </div>

          <Button onClick={fetchProfile}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="bg-muted mx-auto h-24 w-24 animate-pulse rounded-full" />
                <div className="bg-muted mx-auto mt-4 h-6 w-32 animate-pulse rounded" />
                <div className="bg-muted mx-auto mt-2 h-4 w-40 animate-pulse rounded" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="bg-muted h-5 w-40 animate-pulse rounded" />
                <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
                <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
                <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold">
                  {initials}
                </div>

                <h2 className="text-foreground mt-5 text-xl font-semibold">
                  {user?.name || 'Viewer'}
                </h2>

                <p className="text-muted-foreground mt-1">
                  {user?.email || 'viewer@healthtech.com'}
                </p>

                <div className="badge badge-role-viewer mt-4">
                  <span className="badge-dot" />
                  {user?.role || 'VIEWER'}
                </div>

                <hr className="border-border my-6 mt-4 w-full" />

                <div className="mt-5 w-full space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Email address</p>
                      <p className="text-muted-foreground text-sm">{user?.email || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <p className="text-muted-foreground text-sm">{user?.role || 'VIEWER'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Member since</p>
                      <p className="text-muted-foreground text-sm">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account information</CardTitle>

                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit profile
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="font-medium">Full name</p>
                  <div className="border-border bg-background flex items-center rounded-xl border px-4 py-3">
                    <User className="text-muted-foreground mr-3 h-5 w-5" />
                    <span>{user?.name || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Email address</p>
                  <div className="border-border bg-background flex items-center rounded-xl border px-4 py-3">
                    <Mail className="text-muted-foreground mr-3 h-5 w-5" />
                    <span>{user?.email || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Account role</p>
                  <div className="border-border bg-background flex items-center rounded-xl border px-4 py-3">
                    <Shield className="text-muted-foreground mr-3 h-5 w-5" />
                    <span>{user?.role || 'VIEWER'}</span>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account activity</h3>

                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Account created</p>
                    <p className="font-medium">{formatDate(user?.createdAt)}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Last updated</p>
                    <p className="font-medium">{formatDate(user?.updatedAt)}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Account status</p>
                    <div className="badge badge-published">
                      <span className="badge-dot" />
                      Active
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
