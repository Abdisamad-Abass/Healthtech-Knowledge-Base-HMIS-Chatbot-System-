'use client';

import {
  FilePenLine,
  CircleAlert,
  Hourglass,
  TriangleAlert,
  Plus,
  Star,
  ThumbsDown,
  ExternalLink,
  CircleCheck,
  MoveRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

type DashboardData = {
  editor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  stats: {
    total: number;
    draft: number;
    submitted: number;
    inReview: number;
    approved: number;
    rejected: number;
    published: number;
    archived: number;
    deleted: number;
    views: number;
    avgRating: number;
  };

  articles: Array<{
    id: string;
    title: string;
    status: string;
    reviewComments: string | null;
    updatedAt: string;
    avgRating: number;
    category: {
      id: string;
      name: string;
    } | null;
  }>;

  feedbacks: Array<{
    id: string;
    rating: number;
    comment: string | null;
    article: {
      id: string;
      title: string;
    };
  }>;
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await api.get('/articles/editor/dashboard');

        setDashboard(response.data);
      } catch (error) {
        console.error('Failed to fetch editor dashboard:', error);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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

  if (error) {
    return <div className="rounded-lg bg-red-50 p-5 text-red-600">{error}</div>;
  }

  if (!dashboard) return null;

  const { editor, stats, articles, feedbacks } = dashboard;

  /* Dashboard Cards */

  const cards = [
    {
      icon: FilePenLine,
      number: stats.draft,
      status: 'Draft',
      href: '/editor/drafts',
      bg: '#E6E8EA',
    },
    {
      icon: Hourglass,
      number: stats.submitted + stats.inReview,
      status: 'Awaiting Review',
      href: '/editor/review',
      bg: '#E7FCFA',
    },
    {
      icon: CircleCheck,
      number: stats.published,
      status: 'Published',
      href: '/editor/published',
      bg: '#86F2E4',
    },
    {
      icon: CircleAlert,
      number: stats.rejected,
      status: 'Rejected — needs changes',
      href: '/editor/rejected',
      bg: '#FFDAD6',
    },
  ];

  /* Articles that may need attention */

  const attentionArticles = articles.filter((article) => article.status === 'REJECTED');

  /* Recent Articles */

  const recentArticles = articles.slice(0, 4);

  /* Format Relative Time */

  const formatTimeAgo = (date: string) => {
    const updatedDate = new Date(date);
    const now = new Date();

    const differenceInSeconds = Math.floor((now.getTime() - updatedDate.getTime()) / 1000);

    // Less than 1 minute
    if (differenceInSeconds < 60) {
      return 'Just now';
    }

    // Minutes
    const minutes = Math.floor(differenceInSeconds / 60);

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    }

    // Hours
    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
    }

    // Days
    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Weeks
    const weeks = Math.floor(days / 7);

    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Months
    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // Years
    const years = Math.floor(days / 365);

    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  /* Status Styling */

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700';

      case 'DRAFT':
        return 'bg-gray-100 text-gray-600';

      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700';

      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700';

      case 'APPROVED':
        return 'bg-purple-100 text-purple-700';

      case 'REJECTED':
        return 'bg-red-100 text-red-700';

      case 'ARCHIVED':
        return 'bg-orange-100 text-orange-700';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Welcome back, {editor.name} — here's your writing overview
        </h1>

        <p>Review your latest clinical submissions and address pending feedback items.</p>
      </div>

      {/* Overview Cards */}
      <section className="mt-10 grid grid-cols-4 gap-3">
        {cards.map((item, index) => (
          <div className="rounded-lg border border-[#E4E6ED] bg-white p-5" key={index}>
            <div className="flex items-center justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon />
              </div>

              <button className="flex items-center gap-1 text-[#004AC6] hover:underline">
                View All
                <MoveRight size={14} />
              </button>
            </div>

            <div className="mt-2">
              <span className="text-lg font-bold">{item.number}</span>
              <p>{item.status}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Attention and Create Article */}
      <section className="mt-10 grid grid-cols-[7fr_3fr] gap-5">
        {/* Needs Attention */}
        <div className="overflow-hidden rounded-2xl border border-[#F0DADB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0DADB] bg-[#F4EAEB] px-5 py-3">
            <div className="flex items-center gap-2">
              <TriangleAlert className="text-[#C14144]" />

              <h1 className="text-lg font-bold text-[#C14144]">Needs Your Attention</h1>
            </div>

            <span className="font-bold text-[#C14144]">{attentionArticles.length} Alerts</span>
          </div>

          <div className="mt-3 space-y-3 px-5 py-3">
            {attentionArticles.length === 0 ? (
              <p className="py-5 text-center text-gray-500">
                No articles currently need your attention.
              </p>
            ) : (
              attentionArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-xl border border-[#F4EAEB] bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{article.title}</h2>

                      <p className="text-sm text-gray-700">
                        {article.reviewComments ||
                          'This article requires changes before resubmission.'}
                      </p>
                    </div>

                    <button className="rounded-xl bg-[#004AC6] px-5 py-2 font-bold text-white">
                      Revise & Resubmit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Article */}
        <div className="flex flex-col rounded-xl bg-[#0C53C9] p-7">
          <div>
            <h1 className="text-lg font-bold text-white">Ready to publish?</h1>

            <p className="mt-1 text-white">
              Use our standardized clinical templates to ensure your SOPs meet compliance standards.
            </p>
          </div>

          <Link
            href="/editor/articles/new"
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-4 font-bold text-[#0C53C9]"
          >
            <Plus />
            <span>Create New Article</span>
          </Link>
        </div>
      </section>

      {/* My Articles and Feedback */}
      <section className="mt-10 grid grid-cols-[8fr_3fr] gap-5">
        {/* Recent Articles */}
        <div className="overflow-hidden rounded-xl border border-gray-400 bg-white">
          <div className="flex items-center justify-between border-b border-gray-400 px-5 py-3">
            <h1 className="text-lg font-bold">My Recent Articles</h1>

            <button className="text-sm font-semibold text-[#0C53C9] hover:underline">
              View History
            </button>
          </div>

          <div className="scrollbar-thin scrollbar-thumb-gray-400 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F2F4F6]">
                <tr>
                  <th className="px-5 py-2 font-semibold tracking-wide text-gray-500">TITLE</th>

                  <th className="px-5 py-2 font-semibold tracking-wide text-gray-500">CATEGORY</th>

                  <th className="px-5 py-2 font-semibold tracking-wide text-gray-500">STATUS</th>

                  <th className="px-5 py-2 font-semibold tracking-wide text-gray-500">UPDATED</th>

                  <th className="px-5 py-2 font-semibold tracking-wide text-gray-500">RATING</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-400">
                {recentArticles.map((article) => (
                  <tr key={article.id} className="transition-colors hover:bg-gray-50">
                    {/* Title */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{article.title}</p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                      {article.category?.name || 'Uncategorized'}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          article.status,
                        )}`}
                      >
                        {article.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                      <span className="text-gray-500">{formatTimeAgo(article.updatedAt)}</span>
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {article.avgRating > 0 ? (
                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                          <Star size={16} fill="currentColor" className="text-yellow-400" />

                          {article.avgRating.toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side */}
        <div className="grid grid-cols-1 gap-3">
          {/* Feedback Alert */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h1 className="font-bold">Feedback Alert</h1>

              <div className="h-2 w-2 rounded-full bg-[#BA1A1A]" />
            </div>

            {feedbacks.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">No feedback received yet.</p>
            ) : (
              <div className="mt-4">
                {feedbacks.slice(0, 1).map((feedback) => (
                  <div key={feedback.id} className="flex items-start gap-2">
                    <div className="rounded-xl bg-[#FFDAD6] p-2">
                      <ThumbsDown />
                    </div>

                    <div>
                      <h2 className="font-bold">{feedback.article.title}</h2>

                      <div className="flex items-center">
                        <Star className="fill-[#BB1A1C] text-[#BB1A1C]" size={13} />

                        <span className="font-bold text-[#BB1A1C]">{feedback.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-2 border-l-2 border-gray-500">
                  <p className="ml-2 font-medium text-gray-700 italic">
                    {feedbacks[0].comment || 'No comment provided.'}
                  </p>
                </div>

                <button className="mt-2 flex items-center gap-1 font-bold text-blue-500 hover:underline">
                  View Feedback
                  <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="card">
            <h1 className="font-bold">Performance Summary</h1>

            <div className="mt-3 flex items-center justify-between">
              <p>Total Articles</p>
              <span className="font-bold">{stats.total}</span>
            </div>

            <div className="flex items-center justify-between">
              <p>Total Views</p>
              <span className="font-bold">{stats.views}</span>
            </div>

            <div className="flex items-center justify-between">
              <p>Average Rating</p>
              <span className="font-bold">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
