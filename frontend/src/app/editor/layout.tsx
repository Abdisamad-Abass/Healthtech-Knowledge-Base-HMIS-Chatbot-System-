'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  BookOpenCheck,
  UserCircle,
  LogOut,
  LifeBuoy,
  Plus,
  HeartPulse,
} from 'lucide-react';

import api from '@/lib/api';
import EditorNavbar from '@/components/navbar/EditorNavbar';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const links = [
    { title: 'Dashboard', href: '/editor/dashboard', icon: LayoutDashboard },
    { title: 'Articles', href: '/editor/articles', icon: BookOpenCheck },
    { title: 'Search', href: '/editor/search', icon: BookOpenCheck },
    { title: 'My Profile', href: '/editor/profile', icon: UserCircle },
  ];
  // logout
  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const token = localStorage.getItem('token');

      if (token) {
        await api.post(
          '/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login
      router.replace('/login');

      // Refresh application state
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* left sidebar */}
      <aside className="border-sidebar-border bg-sidebar fixed top-0 left-0 h-screen w-60 border-r">
        <div className="flex h-full flex-col px-3 py-4">
          {/* Logo */}
          <div className="border-sidebar-border mb-2 border-b pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm">
                <HeartPulse className="size-5" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-bold"> HealthTech KB </h1>
                <p className="text-muted-foreground text-xs"> Editor workspace </p>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent flex-col gap-2 overflow-y-auto hover:scrollbar-thumb-gray-300">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className={`rounded-lg px-4 py-2 font-medium transition-all ${
                    active
                      ? 'bg-primary/10 border-primary text-primary border-r-4 shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <link.icon size={18} />
                    {link.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-border mt-auto border-t pt-4">
            {/* Create Article */}
            <Link href="/editor/articles/new">
              <Button className="mb-3 w-full justify-start gap-2 rounded-xl">
                <Plus className="size-4" /> Create article
              </Button>
            </Link>

            {/* Support */}
            <button
              type="button"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
            >
              <LifeBuoy size={18} />
              <span>Support</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={18} />

              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Right Side */}
      <div className="ml-60 flex-1">
        {/* top Navbar */}
        <EditorNavbar />
        {/* Current Page */}
        <main className="bg-background min-h-screen p-8 pt-20">{children}</main>
        {/* Footer */}
        <footer className="border-border bg-card mt-auto border-t">
          <div className="text-muted-foreground flex items-center justify-between px-8 py-4 text-sm">
            <p> © {new Date().getFullYear()} HealthTech Knowledge Base </p>
            <p>Editor portal • Clinical Precision UI</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
