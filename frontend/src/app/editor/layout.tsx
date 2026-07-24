'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  BookOpenCheck,
  UsersRound,
  History,
  Settings,
  UserCircle,
  LogOut,
  LifeBuoy,
} from 'lucide-react';

import api from '@/lib/api';
import EditorNavbar from '@/components/EditorNavbar';

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
      <aside className="fixed top-0 left-0 h-screen w-64 border-r border-gray-300 bg-[#F3F3FC]">
        <div className="flex h-full flex-col p-3">
          {/* Logo */}
          <header>
            <h1 className="text-2xl font-bold text-[#0F52BA]">HealthTech Admin</h1>
            <p className="text-sm text-gray-500">System Oversight</p>
          </header>

          {/* Navigation */}
          <nav className="mt-10 flex flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className={`rounded-xl px-4 py-3 font-medium transition-all ${
                    active ? 'bg-[#82aeef] text-white shadow-md' : 'text-gray-700 hover:bg-blue-100'
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
          <div className="mt-auto border-t border-gray-200 pt-4">
            {/* Create Article */}
            <Link
              href="/editor/articles/create"
              className="mb-3 flex w-full items-center justify-center rounded-xl bg-[#0F52BA] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Create Article
            </Link>

            {/* Support */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-100 hover:text-[#0F52BA]"
            >
              <LifeBuoy size={18} />
              <span>Support</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={18} />

              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Right Side */}
      <div className="ml-64 flex-1">
        {/* top Navbar */}
        <EditorNavbar />

        {/* Current Page */}
        <main className="min-h-screen bg-[#F7F9FB] p-8 pt-10">{children}</main>
        {/* Footer */}
        <footer className="border-t bg-white px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} HealthTech Knowledge Base. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
