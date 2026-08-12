'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/themes/theme-toggle';
import { Search, Bell, Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Search', href: '/admin/search' },
    { label: 'HMIS', href: '/hmis' },
  ];

  const pageTitle = pathname.includes('/articles')
    ? 'Articles'
    : pathname.includes('/users')
      ? 'User management'
      : pathname.includes('/search')
        ? 'Search'
        : pathname.includes('/settings')
          ? 'Settings'
          : pathname.includes('/audit-logs')
            ? 'Audit logs'
            : pathname.includes('/profile')
              ? 'My profile'
              : 'Dashboard';

  return (
    <header className="border-border bg-background/80 fixed top-0 right-0 left-60 z-50 border-b backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>HealthTech KB</span>
              <ChevronRight className="h-3 w-3" />
              <span>{pageTitle}</span>
            </div>
            <h1 className="text-foreground text-base font-semibold">{pageTitle}</h1>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Navigation */}
          <nav className="border-border bg-card hidden items-center rounded-xl border p-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <Button variant="outline" size="icon" className="rounded-xl">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative rounded-xl">
            <Bell className="h-4 w-4" />
            <span className="bg-vital absolute top-2 right-2 h-2 w-2 rounded-full" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
