'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Lock,
  Mail,
  Bookmark,
  Save,
  RefreshCw,
} from 'lucide-react';

import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ViewerSettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [articleUpdates, setArticleUpdates] = useState(true);
  const [readingHistory, setReadingHistory] = useState(true);
  const [bookmarkSync, setBookmarkSync] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    console.log('Settings saved');
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

            <h1 className="text-foreground text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your viewer preferences and account settings.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchUser}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                <div className="bg-muted h-16 w-full animate-pulse rounded-xl" />
                <div className="bg-muted h-16 w-full animate-pulse rounded-xl" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your account information and security settings.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Email address</p>
                      <p className="text-muted-foreground text-sm">{user?.email}</p>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => router.push('/viewer/profile')}>
                    View profile
                  </Button>
                </div>

                <div className="border-border border-t" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-muted-foreground text-sm">Keep your account secure</p>
                    </div>
                  </div>

                  <Button variant="outline">Change password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Choose how the knowledge base looks on your device.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="border-border bg-background hover:border-primary/40 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <Sun className="text-primary h-5 w-5" />
                    <p className="font-medium">Light mode</p>
                  </div>
                  <Monitor className="text-muted-foreground h-4 w-4" />
                </div>

                <div className="border-border bg-background hover:border-primary/40 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <Moon className="text-primary h-5 w-5" />
                    <p className="font-medium">Dark mode</p>
                  </div>
                  <Monitor className="text-muted-foreground h-4 w-4" />
                </div>

                <div className="border-border bg-background hover:border-primary/40 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <Monitor className="text-primary h-5 w-5" />
                    <p className="font-medium">System preference</p>
                  </div>
                  <Monitor className="text-muted-foreground h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Control when you receive updates from the knowledge base.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-muted-foreground text-sm">
                        Receive important account and content updates
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="border-border text-primary focus:ring-primary h-5 w-5 rounded"
                  />
                </div>

                <div className="border-border border-t" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Article updates</p>
                      <p className="text-muted-foreground text-sm">
                        Notify me when bookmarked articles are updated
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={articleUpdates}
                    onChange={(e) => setArticleUpdates(e.target.checked)}
                    className="border-border text-primary focus:ring-primary h-5 w-5 rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reading preferences</CardTitle>
                <CardDescription>
                  Manage your reading history and bookmark behavior.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bookmark className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Sync bookmarks</p>
                      <p className="text-muted-foreground text-sm">
                        Keep bookmarks available across devices
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={bookmarkSync}
                    onChange={(e) => setBookmarkSync(e.target.checked)}
                    className="border-border text-primary focus:ring-primary h-5 w-5 rounded"
                  />
                </div>

                <div className="border-border border-t" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Reading history</p>
                      <p className="text-muted-foreground text-sm">
                        Save recently viewed articles and activity
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={readingHistory}
                    onChange={(e) => setReadingHistory(e.target.checked)}
                    className="border-border text-primary focus:ring-primary h-5 w-5 rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage access and account security options.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Account role</p>
                      <p className="text-muted-foreground text-sm">{user?.role}</p>
                    </div>
                  </div>

                  <div className="badge badge-role-viewer">
                    <span className="badge-dot" />
                    Viewer
                  </div>
                </div>

                <div className="border-border border-t" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium">Active session</p>
                      <p className="text-muted-foreground text-sm">
                        This browser session is currently active
                      </p>
                    </div>
                  </div>

                  <Button variant="outline">Manage sessions</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
