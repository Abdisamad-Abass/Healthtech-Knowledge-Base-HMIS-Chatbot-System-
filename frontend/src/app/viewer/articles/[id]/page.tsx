'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Star,
  Tag,
  User,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TagType = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type Author = {
  id: string;
  name: string;
  email?: string;
};

type Feedback = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

type RelatedArticle = {
  id: string;
  title: string;
  createdAt: string;
  views: number;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  type?: string;
  product?: string | null;
  views: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  publishedAt?: string | null;
  category?: Category | null;
  author?: Author | null;
  tags: TagType[];
  feedback: Feedback[];
  relatedArticles: RelatedArticle[];
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/ /g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function ViewerArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const readingTime = useMemo(
    () => (article ? estimateReadingTime(article.content) : 0),
    [article],
  );

  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/articles/${articleId}`);
        setArticle(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const submitFeedback = async () => {
    if (!article) return;

    try {
      setSubmitting(true);

      await api.post(`/articles/${article.id}/feedback`, {
        rating,
        comment: comment.trim() || undefined,
      });

      const { data } = await api.get(`/articles/${article.id}`);
      setArticle(data);
      setComment('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareArticle = async () => {
    if (!article) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Article link copied to clipboard.');
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        {' '}
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
          {' '}
          <div className="skeleton h-10 w-40 rounded-xl" />{' '}
          <div className="skeleton h-72 rounded-3xl" />{' '}
          <div className="skeleton h-6 w-3/4 rounded-lg" />{' '}
          <div className="skeleton h-6 w-1/2 rounded-lg" />{' '}
          <div className="skeleton h-64 rounded-3xl" />{' '}
        </div>{' '}
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-background min-h-screen">
        {' '}
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-8">
          {' '}
          <Card className="w-full">
            {' '}
            <CardContent className="space-y-4 p-8 text-center">
              {' '}
              <div className="bg-danger-bg text-danger mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                {' '}
                <BookOpen className="h-7 w-7" />{' '}
              </div>{' '}
              <div className="space-y-2">
                {' '}
                <h2 className="text-foreground text-2xl font-semibold">Article not found</h2>{' '}
                <p className="text-muted-foreground">
                  {error ||
                    'The article you are looking for does not exist or is not available.'}{' '}
                </p>{' '}
              </div>
              <Button onClick={() => router.push('/viewer')}>
                {' '}
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to knowledge base{' '}
              </Button>{' '}
            </CardContent>{' '}
          </Card>{' '}
        </div>{' '}
      </div>
    );
  }

  // Put this before return
  const publishedRelatedArticles =
    article.relatedArticles?.filter((related: any) => related.status === 'PUBLISHED') || [];

  return (
    <div className="bg-background min-h-screen">
      {' '}
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/viewer')}
          className="text-primary hover:bg-primary/5"
        >
          {' '}
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to knowledge base{' '}
        </Button>
        <section className="border-border from-accent via-background to-primary/5 overflow-hidden rounded-3xl border bg-gradient-to-br">
          <div className="space-y-6 p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              {article.category && (
                <span className="badge border-border bg-accent text-primary">
                  <span className="badge-dot bg-primary" />
                  {article.category.name}
                </span>
              )}

              {article.type && (
                <span className="badge border-border bg-card text-foreground">
                  <span className="badge-dot bg-primary" />
                  {article.type.replaceAll('_', ' ')}
                </span>
              )}

              <div className="text-warning ml-auto flex items-center gap-1 text-sm font-medium">
                <Star className="fill-warning h-4 w-4" />
                {article.avgRating?.toFixed(1) || '0.0'}
                <span className="text-muted-foreground">({article.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
                {article.title}
              </h1>

              <div className="text-muted-foreground flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author?.name || 'Unknown author'}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {article.views.toLocaleString()} views
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={shareArticle}>
                <Share2 className="mr-2 h-4 w-4" />
                Share article
              </Button>

              <Button variant="outline" onClick={() => router.push('/viewer')}>
                Browse more articles
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <div
                  className="prose text-foreground max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>

            {article.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="text-primary h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-primary border-border bg-muted inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-warning h-5 w-5" />
                  Rate this article
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={
                          value <= rating
                            ? 'text-warning fill-warning h-7 w-7'
                            : 'text-muted-foreground h-7 w-7'
                        }
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your feedback about this article (optional)"
                  className="border-input bg-card text-foreground focus:border-primary focus:ring-primary/20 min-h-[120px] w-full rounded-xl border p-3 outline-none"
                />

                <Button onClick={submitFeedback} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit feedback'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-primary h-5 w-5" />
                  Reader feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.feedback.length === 0 ? (
                  <p className="text-muted-foreground">No feedback yet. Be the first to review.</p>
                ) : (
                  article.feedback.map((item) => (
                    <div key={item.id} className="border-border rounded-2xl border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold">
                            {getInitials(item.user.name)}
                          </div>

                          <div>
                            <p className="text-foreground font-medium">{item.user.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-warning flex items-center gap-1">
                          <Star className="fill-warning h-4 w-4" />
                          {item.rating}
                        </div>
                      </div>

                      {item.comment && <p className="text-foreground leading-7">{item.comment}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </article>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground font-medium">
                    {article.category?.name || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reading time</span>
                  <span className="text-foreground font-medium">{readingTime} min</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="text-foreground font-medium">{article.views}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average rating</span>
                  <span className="text-foreground font-medium">
                    {article.avgRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the author</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
                    {getInitials(article.author?.name)}
                  </div>

                  <div>
                    <p className="text-foreground font-medium">
                      {article.author?.name || 'Unknown author'}
                    </p>
                    <p className="text-muted-foreground text-sm">Knowledge base contributor</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-6">
                  This article is part of the HealthTech Knowledge Base and HMIS documentation
                  library.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {publishedRelatedArticles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No related articles found.</p>
                ) : (
                  publishedRelatedArticles.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => router.push(`/viewer/articles/${related.id}`)}
                      className="border-border hover:border-primary/30 hover:bg-accent/40 flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-medium">{related.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(related.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
