'use client';

import Link from 'next/link';
import { Search, BookOpen, User, Settings, Bookmark, History, LogOut } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function ViewerNavbar() {
  return (
    <header className="bg-card/95 border-border supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo + Brand */}
        <Link href="/viewer" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-foreground text-sm font-semibold">HealthTech Knowledge Base</h1>
            <p className="text-muted-foreground text-xs">Viewer portal</p>
          </div>
        </Link>

        {/* Search */}
        <div className="hidden max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search articles, SOPs, FAQs, or troubleshooting guides..."
              className="bg-background h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="hover:bg-accent flex items-center gap-3 rounded-xl px-2"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
                <User className="h-4 w-4" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-foreground text-sm font-medium">Viewer</p>
                <p className="text-muted-foreground text-xs">viewer@healthtech.com</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <div className="border-border border-b px-3 py-3">
              <p className="text-foreground text-sm font-semibold">Viewer Account</p>
              <p className="text-muted-foreground text-xs">viewer@healthtech.com</p>
            </div>

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </DropdownMenuItem>

              <DropdownMenuItem>
                <History className="h-4 w-4" />
                Reading history
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
