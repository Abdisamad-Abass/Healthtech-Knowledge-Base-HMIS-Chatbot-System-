'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  User,
  Settings,
  Bookmark,
  History,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

import { useTheme } from 'next-themes';

import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Suggestion = {
  text: string;
  type: string;
  label: string;
};

export function ViewerNavbar() {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [user, setUser] = useState<UserData | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    }

    fetchUser();
  }, []);

  async function getSuggestions(text: string) {
    const value = text.trim();

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);

      const { data } = await api.get('/search/auto-complete', {
        params: {
          q: value,
          limit: 8,
        },
      });

      setSuggestions(data || []);
      setShowSuggestions((data || []).length > 0);
    } catch (error) {
      console.error('Autocomplete failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function performSearch(searchText: string) {
    const value = searchText.trim();

    if (!value) return;

    try {
      const { data } = await api.get('/search', {
        params: {
          q: value,
          page: 1,
          limit: 1,
        },
      });

      setShowSuggestions(false);

      if (data.results?.length > 0) {
        router.push(`/viewer/articles/${data.results[0].id}`);
      } else {
        router.push(`/viewer/search?q=${encodeURIComponent(value)}`);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'V';

  const activeTheme = (mode: string) => {
    if (mode === 'system') return theme === 'system';

    return resolvedTheme === mode && theme !== 'system';
  };

  return (
    <header className="bg-card/95 border-border sticky top-0 z-50 border-b backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <Link href="/viewer" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-foreground text-sm font-semibold">HealthTech Knowledge Base</h1>

            <p className="text-muted-foreground text-xs">HMIS viewer portal</p>
          </div>
        </Link>

        <div className="relative hidden max-w-xl flex-1 md:flex">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              getSuggestions(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                performSearch(query);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search HMIS articles, user guides, FAQs, or troubleshooting..."
            className="bg-background h-10 rounded-xl pl-10 transition-colors"
          />

          {showSuggestions && (
            <div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border shadow-xl">
              {loadingSuggestions ? (
                <div className="text-muted-foreground px-4 py-3 text-sm">Searching...</div>
              ) : (
                suggestions.map((item, index) => (
                  <button
                    key={`${item.text}-${index}`}
                    type="button"
                    onMouseDown={() => {
                      setQuery(item.text);
                      performSearch(item.text);
                    }}
                    className="hover:bg-accent text-foreground flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="text-muted-foreground h-4 w-4" />

                      <span className="text-sm">{item.text}</span>
                    </div>

                    <span className="text-muted-foreground text-xs capitalize">{item.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent flex items-center gap-2 rounded-xl px-2 py-2 transition-colors outline-none">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
              {initials}
            </div>

            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="bg-card border-border text-foreground w-[calc(100vw-2rem)] max-w-64 rounded-xl shadow-xl"
          >
            <div className="border-border border-b px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {user?.name || 'Viewer'}
                  </p>

                  <p className="text-muted-foreground truncate text-xs">
                    {user?.email || 'viewer@healthtech.com'}
                  </p>

                  <p className="text-primary mt-1 text-xs font-medium">{user?.role || 'VIEWER'}</p>
                </div>
              </div>
            </div>

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/viewer/profile')}
                className="focus:bg-accent focus:text-foreground cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/viewer/bookmarks')}
                className="focus:bg-accent focus:text-foreground cursor-pointer"
              >
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/viewer/history')}
                className="focus:bg-accent focus:text-foreground cursor-pointer"
              >
                <History className="h-4 w-4" />
                Reading history
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/viewer/settings')}
                className="focus:bg-accent focus:text-foreground cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <div className="px-3 py-2">
              <p className="text-muted-foreground mb-2 px-1 text-xs font-medium">Appearance</p>

              <div className="bg-background border-border flex items-center justify-between rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  title="Light mode"
                  className={`flex flex-1 items-center justify-center rounded-md p-2 transition-colors ${
                    activeTheme('light')
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  title="Dark mode"
                  className={`flex flex-1 items-center justify-center rounded-md p-2 transition-colors ${
                    activeTheme('dark')
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  title="System theme"
                  className={`flex flex-1 items-center justify-center rounded-md p-2 transition-colors ${
                    activeTheme('system')
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
