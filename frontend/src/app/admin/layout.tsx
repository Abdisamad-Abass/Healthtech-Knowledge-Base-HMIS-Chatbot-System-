'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  BookOpenCheck,
  UsersRound,
  History,
  MessageCircleQuestion,
  UserCircle,
  LogOut,
  LifeBuoy,
  Settings,
  Plus,
  ShieldPlus,
} from 'lucide-react';

import api from '@/lib/api';
import AdminNavbar from '@/components/navbar/AdminNavbar';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Articles', href: '/admin/articles', icon: BookOpenCheck },
    { title: 'Search', href: '/admin/search', icon: BookOpenCheck },
    {
      title: 'Unanswered Questions',
      href: '/admin/unanswered-questions',
      icon: MessageCircleQuestion,
    },
    { title: 'User Management', href: '/admin/users', icon: UsersRound },
    { title: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    {
      title: 'My Profile',
      href: '/admin/profile',
      icon: UserCircle,
    },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
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
      // Always clear local authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login
      router.replace('/login');

      // Prevent returning to protected page using browser back
      router.refresh();
    }
  };
  return (
    <main className="flex min-h-screen">
      {/* left sidebar */}
      <aside className="border-sidebar-border bg-sidebar fixed top-0 left-0 h-screen w-60 border-r">
        <div className="flex h-full flex-col px-3 py-4">
          {/* Logo */}
          <header className="border-sidebar-border mb-2 border-b pb-5">
            <Link href="/admin/dashboard" className="group flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                <ShieldPlus className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="text-foreground text-sm leading-tight font-bold">HealthTech KB</h1>
                <p className="text-muted-foreground text-xs">Knowledge Management</p>
              </div>
            </Link>
          </header>

          {/* Navigation */}
          <nav className="flex scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent flex-col gap-2 overflow-y-auto hover:scrollbar-thumb-gray-300">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className={`rounded-lg px-2 py-3 text-xs font-medium transition-all ${
                    active
                      ? 'border-primary bg-primary/10 text-primary border-r-4'
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

          {/* Bottom section */}
          <div className="border-sidebar-border mt-auto border-t pt-4">
            <Button className="mb-3 w-full justify-start">
              <Link href="/admin/articles/create" className="flex w-full items-center gap-2">
                <Plus size={18} />
                Create article
              </Link>
            </Button>

            <button
              type="button"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
            >
              <LifeBuoy size={18} />
              Support
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={18} />
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Right Side */}
      <div className="ml-60 min-w-0 flex-1">
        {/* top Navbar */}
        <AdminNavbar />

        {/* Main Pages */}
        <main className="bg-background min-h-screen min-w-0 overflow-x-hidden p-6 pt-20">
          {children}
        </main>
        {/* Footer */}
        <footer className="border-border bg-card text-muted-foreground border-t px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row">
            <p>© {new Date().getFullYear()} HealthTech Knowledge Base</p>
            <p className="text-xs">Clinical Precision • Knowledge Management Platform</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
