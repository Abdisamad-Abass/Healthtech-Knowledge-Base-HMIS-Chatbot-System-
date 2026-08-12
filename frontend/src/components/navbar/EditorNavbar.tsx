'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  ChevronRight,
} from 'lucide-react';

import api from '@/lib/api';
import ThemeToggle from '@/components/themes/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export default function EditorNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get<UserProfile>('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
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
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
      router.refresh();
    }
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ED';

  const navLinks = [
    { label: 'Dashboard', href: '/editor/dashboard' },
    { label: 'Articles', href: '/editor/articles' },
    { label: 'Search', href: '/editor/search' },
    { label: 'HMIS', href: '/hmis' },
  ];

  const pageTitle = pathname.includes('/articles')
    ? 'Articles'
    : pathname.includes('/search')
      ? 'Search'
      : pathname.includes('/profile')
        ? 'My profile'
        : pathname.includes('/dashboard')
          ? 'Dashboard'
          : 'Dashboard';

  return (
    <header className="bg-card/95 border-border supports-[backdrop-filter]:bg-card/80 fixed top-0 right-0 left-60 z-50 border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Activity className="h-5 w-5" />
            </div>

            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>Editor portal</span>
                <ChevronRight className="h-3 w-3" />
                <span>{pageTitle}</span>
              </div>

              <h1 className="text-foreground text-base font-semibold">{pageTitle}</h1>
            </div>
          </div>
        </div>

        {/* nav */}
        <div>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Bell className="size-4" />
            <span className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="hover:bg-accent flex items-center gap-3 rounded-xl p-2 transition-colors">
                <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold">
                  {initials}
                </div>

                <ChevronDown className="text-muted-foreground size-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/editor/profile')}>
                <UserCircle className="size-4" />
                My profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/editor/settings')}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
