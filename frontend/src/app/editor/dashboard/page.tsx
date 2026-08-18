'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  ArrowUpRight,
} from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

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
        const res = await api.get('/articles/editor/dashboard');
        setDashboard(res.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-border bg-danger-bg">
        <CardContent className="pt-6">
          <p className="text-danger">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard) return null;

  const { editor, stats, articles, feedbacks } = dashboard;

  const cards = [
    {
      icon: FilePenLine,
      value: stats.draft,
      label: 'Draft articles',
      href: '/editor/drafts',
      color: 'bg-muted',
    },
    {
      icon: Hourglass,
      value: stats.submitted + stats.inReview,
      label: 'Awaiting review',
      href: '/editor/review',
      color: 'bg-warning-bg',
    },
    {
      icon: CircleCheck,
      value: stats.published,
      label: 'Published',
      href: '/editor/published',
      color: 'bg-success-bg',
    },
    {
      icon: CircleAlert,
      value: stats.rejected,
      label: 'Rejected',
      href: '/editor/rejected',
      color: 'bg-danger-bg',
    },
  ];

  const attentionArticles = articles.filter((a) => a.status === 'REJECTED');
  const recentArticles = articles.slice(0, 5);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'badge badge-draft';
      case 'SUBMITTED':
        return 'badge badge-submitted';
      case 'IN_REVIEW':
        return 'badge badge-in-review';
      case 'APPROVED':
        return 'badge badge-approved';
      case 'PUBLISHED':
        return 'badge badge-published';
      case 'REJECTED':
        return 'badge badge-rejected';
      case 'ARCHIVED':
        return 'badge badge-archived';
      default:
        return 'badge';
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Dashboard header */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-2 w-2 rounded-full" />
                <p className="text-muted-foreground text-sm font-medium">Editor workspace</p>
              </div>

              <div className="space-y-1">
                <h1 className="text-foreground text-3xl font-bold tracking-tight">
                  Welcome back, {editor.name}
                </h1>

                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  Manage clinical articles, respond to review feedback, and monitor publication
                  performance from one dashboard.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                <div className="flex items-center gap-2">
                  <CircleCheck className="text-success h-4 w-4" />
                  <span className="text-muted-foreground">
                    {stats.published} published articles
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Hourglass className="text-warning h-4 w-4" />
                  <span className="text-muted-foreground">
                    {stats.submitted + stats.inReview} awaiting review
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">View drafts</Button>

              <Link href="/editor/articles/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create article
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                >
                  <card.icon className="text-primary h-6 w-6" />
                </div>

                <Link href={card.href}>
                  <Button variant="ghost" size="sm">
                    View
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-muted-foreground text-sm">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attention + CTA */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="bg-danger-bg border-danger-border/60 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-danger-bg rounded-xl p-2">
                  <TriangleAlert className="text-danger h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg font-semibold">
                    Needs your attention
                  </CardTitle>

                  <CardDescription className="text-muted-foreground mt-1">
                    Articles that require revision before publication
                  </CardDescription>
                </div>
              </div>

              <span className="badge badge-rejected">{attentionArticles.length} pending</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {attentionArticles.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center rounded-xl border border-dashed">
                No articles currently require attention.
              </div>
            ) : (
              attentionArticles.map((article) => (
                <div
                  key={article.id}
                  className="border-border flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {article.reviewComments ??
                        'This article requires changes before resubmission.'}
                    </p>
                  </div>

                  <Button>
                    Revise article
                    <MoveRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        {/* ready to publish part */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Ready to publish?</CardTitle>

            <CardDescription className="text-primary-foreground/80">
              Create a new article using standardized clinical templates.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col justify-end">
            <Link href="/editor/articles/new" className="w-full">
              <Button
                variant="outline"
                className="bg-card text-primary hover:bg-card/90 border-border/10 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create new article
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Articles + Sidebar */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="bg-muted-soft border-border border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-lg font-semibold">
                  Recent articles
                </CardTitle>

                <CardDescription className="text-muted-foreground mt-1">
                  Your latest article activity
                </CardDescription>
              </div>

              <Button variant="outline" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>

                    <TableCell className="text-muted-foreground text-xs">
                      {article.category?.name ?? 'Uncategorized'}
                    </TableCell>

                    <TableCell>
                      <span className={statusBadge(article.status)}>
                        {article.status.replace('_', ' ')}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatTimeAgo(article.updatedAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      {article.avgRating > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {article.avgRating.toFixed(1)}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Latest feedback</CardTitle>
              <CardDescription>Most recent reviewer comment</CardDescription>
            </CardHeader>

            <CardContent>
              {feedbacks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No feedback received yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-danger-bg rounded-xl p-2">
                      <ThumbsDown className="text-danger h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-medium">{feedbacks[0].article.title}</h4>

                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{feedbacks[0].rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted border-primary rounded-lg border-l-4 p-3">
                    <p className="text-sm italic">
                      {feedbacks[0].comment ?? 'No comment provided.'}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance summary</CardTitle>
              <CardDescription>Your publishing performance</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total articles</span>
                <span className="font-semibold">{stats.total}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total views</span>
                <span className="font-semibold">{stats.views}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Average rating</span>
                <span className="font-semibold">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
                </span>
              </div>

              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Publication progress</span>
                  <span>
                    {stats.published}/{stats.total}
                  </span>
                </div>

                <div className="bg-muted h-2 rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
