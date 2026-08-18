'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';

interface Category {
  id?: string;
  name: string;
  slug?: string;
  createdAt?: string;
}

interface Author {
  id?: string;
  name: string;
  email?: string;
  role?: string;
}

interface Tag {
  id?: string;
  name: string;
  slug?: string;
  createdAt?: string;
}
interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}
interface Article {
  id: string;
  title: string;
  content: string;
  category?: Category | string | null;
  product?: string | null;
  type?: string | null;
  status?: string | null;
  author?: Author | string | null;
  views: number;
  createdAt: string;
  avgRating: number;
  reviewCount: number;
  feedback: Feedback[];
  tags?: (Tag | string)[];
}

export default function ViewArticle() {
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/articles/${id}`);

        console.log('Article response:', res.data);

        const articleData = res.data.article || res.data;

        setArticle(articleData);

        try {
          await api.post(`/articles/${id}/view`);
        } catch (viewError) {
          console.warn('Failed to increment article views:', viewError);
        }
      } catch (error: any) {
        console.error('Error fetching article:', error);

        setError(error?.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground text-2xl font-bold">Article Not Found </h2>
          <p className="text-muted-foreground mt-2">
            {error || "The article you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  /* * Convert category into a safe string */
  const categoryName =
    typeof article.category === 'object' && article.category !== null
      ? article.category.name
      : article.category;

  /* * Convert author into a safe string*/
  const authorName =
    typeof article.author === 'object' && article.author !== null
      ? article.author.name
      : article.author;

  const workflow: Record<string, string> = {
    DRAFT: 'SUBMITTED',
    SUBMITTED: 'IN_REVIEW',
    IN_REVIEW: 'APPROVED',
    APPROVED: 'PUBLISHED',
    PUBLISHED: 'ARCHIVED',
    ARCHIVED: 'DRAFT',
    REJECTED: 'DRAFT',
  };

  const currentStatus = article.status || 'DRAFT';
  const nextStatus = workflow[currentStatus] || 'SUBMITTED';
  // handle next stage
  const handleNextStage = async () => {
    try {
      let endpoint = '';

      switch (currentStatus) {
        case 'DRAFT':
          endpoint = `/articles/${id}/submit`;
          break;

        case 'SUBMITTED':
          endpoint = `/articles/${id}/review`;
          break;

        case 'IN_REVIEW':
          endpoint = `/articles/${id}/approve`;
          break;

        case 'APPROVED':
          endpoint = `/articles/${id}/publish`;
          break;

        case 'PUBLISHED':
          endpoint = `/articles/${id}/archive`;
          break;

        case 'ARCHIVED':
          endpoint = `/articles/${id}/restore`;
          break;

        case 'REJECTED':
          endpoint = `/articles/${id}/resubmit`;
          break;

        default:
          return;
      }

      const res = await api.put(endpoint, {
        comments: '',
      });

      const updatedArticle = res.data.article || res.data;

      setArticle((prev) =>
        prev
          ? {
              ...prev,
              status: updatedArticle.status,
            }
          : prev,
      );
    } catch (error: any) {
      console.error('Failed to move article to next stage:', error);

      alert(error?.response?.data?.message || 'Failed to update article status');
    }
  };

  // handle reject
  /* Workflow actions */

  const handleReject = async () => {
    const comments = prompt('Enter the reason for rejecting this article:');

    if (comments === null) return; // user cancelled

    if (!comments.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      const res = await api.put(`/articles/${id}/reject`, {
        comments,
      });

      const updatedArticle = res.data.article || res.data;

      setArticle((prev) =>
        prev
          ? {
              ...prev,
              status: updatedArticle.status,
            }
          : prev,
      );
    } catch (error: any) {
      console.error('Failed to reject article:', error);

      alert(error?.response?.data?.message || 'Failed to reject article');
    }
  };

  //feedback submit function
  const submitFeedback = async () => {
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }

    try {
      setSubmittingFeedback(true);

      await api.post(`/articles/${id}/feedback`, {
        rating,
        comment,
      });

      // reload article
      const res = await api.get(`/articles/${id}`);
      setArticle(res.data.article || res.data);

      setRating(0);
      setComment('');

      alert('Thank you for your feedback!');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Workflow Status */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {/* Current status */}
        <Button className="badge badge-approved px-4 py-2 text-sm">
          <span className="badge-dot bg-current" />
          Current: {currentStatus.replaceAll('_', ' ')}
        </Button>

        {currentStatus === 'IN_REVIEW' ? (
          <>
            {/* Reject */}
            <Button
              onClick={handleReject}
              className="bg-danger-BG hover:bg-danger-BG dark:text-status-REJECTED text-status-REJECTED border-danger-BORDER dark:border-status-deleted-border/40 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition dark:bg-red-950/30"
            >
              Reject
            </Button>

            {/* Approve */}
            <Button
              onClick={handleNextStage}
              className="border-border bg-card text-foreground hover:border-primary hover:bg-accent hover:text-primary inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
            >
              Approve
            </Button>
          </>
        ) : (
          <Button
            onClick={handleNextStage}
            className="border-border bg-card text-foreground hover:border-primary hover:bg-accent hover:text-primary inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
          >
            Next:
            <span className="font-semibold">{nextStatus.replaceAll('_', ' ')}</span>
            <span>→</span>
          </Button>
        )}
      </div>

      <div className="mx-auto mt-3 max-w-4xl px-4">
        {/* Article Card */}
        <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-sm">
          {/* Article Header */}
          <div className="border-border border-b p-8">
            {/* Metadata Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="badge badge-approved rounded-full px-3 py-1 text-xs font-medium">
                  {categoryName}
                </span>
              )}

              {article.product && (
                <span className="badge badge-submitted rounded-full px-3 py-1 text-xs font-medium">
                  {article.product}
                </span>
              )}

              {article.type && (
                <span className="badge badge-published rounded-full px-3 py-1 text-xs font-medium">
                  {article.type.replaceAll('_', ' ')}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-foreground mb-4 text-xl font-bold">{article.title}</h1>

            {/* Article Information */}
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-4">
                {authorName && (
                  <span>
                    By: <span className="text-foreground font-medium">{authorName}</span>
                  </span>
                )}

                <span>•</span>

                <span>
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>

                <span>{article.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <article
              className="article-content [&_a]:text-primary [&_blockquote]:border-primary [&_blockquote]:bg-accent [&_blockquote]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground [&_p]:text-foreground max-w-none [&_a]:font-medium [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:text-sm [&_blockquote]:leading-7 [&_blockquote]:italic [&_h1]:mt-8 [&_h1]:mb-5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:shadow-md [&_li]:pl-2 [&_li]:text-lg [&_li]:leading-8 [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_p]:mb-5 [&_p]:text-lg [&_p]:leading-8 [&_strong]:font-bold [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-3"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="border-border mt-8 border-t pt-6">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => {
                    /*
                     * Tags can be either:
                     * "health"
                     *
                     * or:
                     * { id, name, slug, createdAt }
                     */
                    const tagName = typeof tag === 'object' ? tag.name : tag;

                    return (
                      <span
                        key={
                          typeof tag === 'object'
                            ? tag.id || `${tag.name}-${index}`
                            : `${tag}-${index}`
                        }
                        className="border-border bg-muted text-muted-foreground hover:border-primary hover:bg-accent hover:text-primary rounded-full border px-3 py-1 text-sm transition"
                      >
                        #{tagName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Article actions */}
        <div className="mt-8 space-y-6">
          {/* Feedback */}
          <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
            <h3 className="text-foreground text-xl font-semibold">Rate this article</h3>

            {/* Average rating */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(article.avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground fill-slate-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <div className="text-right">
                <p className="text-foreground text-sm font-semibold">
                  {article.avgRating.toFixed(1)} / 5
                </p>
                <p className="text-muted-foreground text-sm">
                  {article.reviewCount} {article.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Rating input */}
            <div className="border-border mt-6 border-t pt-6">
              <p className="text-foreground text-sm font-medium">
                {rating === 0 ? 'Select your rating' : `Your rating: ${rating} out of 5`}
              </p>

              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <svg
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-FOREGROUND fill-slate-200'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what was helpful or what could be improved (optional)"
                className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/10 mt-4 w-full rounded-xl border p-3 text-sm outline-none focus:ring-4"
                rows={4}
              />

              <Button
                onClick={submitFeedback}
                disabled={submittingFeedback || rating === 0}
                className="bg-primary text-primary-foreground hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting rating...' : 'Submit rating'}
              </Button>
            </div>
          </div>

          {/* Reader reviews */}
          {article.feedback?.length > 0 && (
            <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
              <h3 className="text-foreground mb-5 text-xl font-semibold">Reader reviews</h3>

              <div className="space-y-5">
                {article.feedback.map((review) => (
                  <div
                    key={review.id}
                    className="border-border border-b pb-5 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium">{review.user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground fill-slate-200'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {review.comment && <p className="text-foreground mt-3">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support */}
          <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
            <h3 className="text-foreground text-lg font-semibold">Need more help?</h3>

            <div className="mt-4 flex gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl px-4 py-2 transition">
                Contact support
              </Button>

              <Button
                onClick={() => window.print()}
                className="border-border text-primary-foreground hover:border-primary hover:bg-accent hover:text-primary rounded-xl border px-4 py-2 transition"
              >
                Print article
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
