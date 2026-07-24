'use client';

/**
 * Editor Dashboard Component
 *
 * This component displays a comprehensive dashboard for editors showing:
 * - Key statistics (total articles, views, ratings, feedback)
 * - Recent feedback from users
 * - Quick access to create new articles
 *
 * @component
 * @returns {JSX.Element} The rendered Editor Dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  FiPlus,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiTrendingUp,
  FiFileText,
  FiMessageSquare,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';

// ============================================================
// TYPES
// ============================================================

/** Represents feedback from a user on an article */
type Feedback = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
  article?: { id: string; title: string } | null;
};

/** Dashboard data structure returned from the API */
type DashboardData = {
  editor: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  stats: {
    published: number;
    inReview: number;
    total: number;
    views: number;
    avgRating: number;
  };
  feedbacks: Feedback[];
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditorDashboard() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  /** Dashboard data from the API */
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  /** Loading state indicator */
  const [loading, setLoading] = useState(true);

  /** Error message if API request fails */
  const [error, setError] = useState('');

  // ============================================================
  // DATA FETCHING
  // ============================================================

  /**
   * Fetches the editor dashboard data from the API
   * Called once on component mount
   */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/articles/editor/dashboard');
        setDashboard(response.data);
      } catch (error: any) {
        console.error('Failed to load editor dashboard:', error);
        setError(error?.response?.data?.message || 'Failed to load editor dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Formats a date string to a readable format
   * @param {string} date - ISO date string
   * @returns {string} Formatted date (e.g., "Jan 15, 2024")
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Converts a date to a human-readable "time ago" string
   * @param {string} date - ISO date string
   * @returns {string} Time ago (e.g., "2h ago", "3d ago")
   */
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const createdDate = new Date(date);
    const difference = now.getTime() - createdDate.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  /**
   * Gets initials from a name for avatar display
   * @param {string} [name] - User's full name
   * @returns {string} Initials (max 2 characters)
   */
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  /**
   * Returns a greeting based on the current time of day
   * @returns {string} Appropriate greeting
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  /**
   * Gets the editor's first name for personalized greeting
   * @returns {string} Editor's first name or fallback
   */
  const getEditorName = () => {
    const name = dashboard?.editor?.name?.trim();
    if (name) return name.split(' ')[0];
    return dashboard?.editor?.email?.split('@')[0] || 'Editor';
  };

  /**
   * Renders star icons based on a rating value
   * @param {number} rating - Rating value (1-5)
   * @returns {JSX.Element[]} Array of star icons
   */
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-3.5 w-3.5 ${
            i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />,
      );
    }
    return stars;
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center">
        <div className="relative">
          {/* Spinner animation */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-600"></div>
          </div>
        </div>
        <p className="mt-6 font-medium text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <FiAlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Oops! Something went wrong</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (!dashboard) return null;

  // ============================================================
  // STATS CARDS CONFIGURATION
  // ============================================================

  const statsCards = [
    {
      label: 'Total Articles',
      value: dashboard.stats.total || 0,
      icon: FiFileText,
      color: 'blue',
      subtext: `${dashboard.stats.published || 0} published • ${dashboard.stats.inReview || 0} in review`,
    },
    {
      label: 'Total Views',
      value: dashboard.stats.views?.toLocaleString() || 0,
      icon: FiEye,
      color: 'emerald',
      subtext: 'Lifetime views across all articles',
    },
    {
      label: 'Avg. Rating',
      value: dashboard.stats.avgRating ? dashboard.stats.avgRating.toFixed(1) : '—',
      icon: FiStar,
      color: 'amber',
      subtext: dashboard.stats.avgRating ? 'Average from all ratings' : 'No ratings yet',
    },
    {
      label: 'Feedback',
      value: dashboard.feedbacks?.length || 0,
      icon: FiMessageSquare,
      color: 'purple',
      subtext: 'Recent user comments',
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="mx-auto max-w-7xl">
        {/* ==========================================================
            HEADER SECTION
            ========================================================== */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Editor avatar and greeting */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg">
                {getInitials(getEditorName())}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {getGreeting()}, {getEditorName()} 👋
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  {dashboard.editor?.email || 'Editor'} • {dashboard.editor?.role || 'Editor'}
                </p>
              </div>
            </div>
          </div>

          {/* Create Article button */}
          <button
            onClick={() => router.push('/editor/articles/new')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <FiPlus className="h-4 w-4" />
            <span className="font-medium">New Article</span>
          </button>
        </div>

        {/* ==========================================================
            STATS CARDS GRID
            ========================================================== */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              emerald: 'bg-emerald-50 text-emerald-600',
              amber: 'bg-amber-50 text-amber-600',
              purple: 'bg-purple-50 text-purple-600',
            };
            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">{stat.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* ==========================================================
            FEEDBACK SECTION
            ========================================================== */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Feedback header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Feedback</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {dashboard.feedbacks?.length || 0} feedback entries
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Last 30 days</span>
                <FiTrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Feedback list */}
          <div className="max-h-[600px] overflow-y-auto">
            {dashboard.feedbacks?.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <FiMessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No feedback yet</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Feedback from users will appear here once they start reviewing your published
                  articles.
                </p>
              </div>
            ) : (
              // Feedback items
              dashboard.feedbacks.map((feedback, index) => (
                <div
                  key={feedback.id}
                  className={`px-6 py-4 transition hover:bg-gray-50/50 ${
                    index !== dashboard.feedbacks.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* User avatar */}
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-semibold text-white">
                        {getInitials(feedback.user?.name)}
                      </div>
                    </div>

                    {/* Feedback content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">
                            {feedback.user?.name || 'Anonymous User'}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(feedback.createdAt)}
                          </span>
                        </div>
                        {/* Rating stars */}
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(feedback.rating)}</div>
                          <span className="ml-1 text-xs text-gray-500">
                            {feedback.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      {feedback.comment && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">
                          {feedback.comment}
                        </p>
                      )}

                      {/* Link to article */}
                      {feedback.article && (
                        <button
                          onClick={() => router.push(`/editor/articles/${feedback.article?.id}`)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                        >
                          <span>View article</span>
                          <FiArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with view all link */}
          {dashboard.feedbacks && dashboard.feedbacks.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
              <button
                onClick={() => router.push('/editor/feedback')}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                <span>View all feedback</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
