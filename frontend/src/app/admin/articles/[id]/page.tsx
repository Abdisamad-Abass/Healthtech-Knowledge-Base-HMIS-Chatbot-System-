'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

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
  tags?: (Tag | string)[];
}

export default function ViewArticle() {
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
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
        {' '}
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />{' '}
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {' '}
        <div className="text-center">
          {' '}
          <h2 className="text-2xl font-bold text-gray-700">Article Not Found </h2>
          <p className="mt-2 text-gray-500">
            {error || "The article you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  /*

* Convert category into a safe string
  */
  const categoryName =
    typeof article.category === 'object' && article.category !== null
      ? article.category.name
      : article.category;

  /*

* Convert author into a safe string
  */
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

  return (
    <div className="min-h-screen">
      {/* Workflow Status */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {/* Current Status - Not Clickable */}
        <span className="inline-flex cursor-default items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
          Current:
          <span>{currentStatus.replaceAll('_', ' ')}</span>
        </span>
        {/* Next Stage - Clickable */}
        <button
          onClick={handleNextStage}
          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
        >
          Next:
          <span className="font-semibold">{nextStatus.replaceAll('_', ' ')}</span>
          <span>→</span>
        </button>
      </div>{' '}
      <div className="mx-auto mt-3 max-w-4xl px-4">
        {/* Article Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Article Header */}
          <div className="border-b border-gray-100 p-8">
            {/* Metadata Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {categoryName}
                </span>
              )}

              {article.product && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  {article.product}
                </span>
              )}

              {article.type && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  {article.type.replaceAll('_', ' ')}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-gray-900">{article.title}</h1>

            {/* Article Information */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-4">
                {authorName && (
                  <span>
                    By: <span className="font-medium text-gray-700">{authorName}</span>
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
              className="article-content max-w-none [&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:bg-blue-50 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:text-lg [&_blockquote]:leading-7 [&_blockquote]:text-gray-700 [&_blockquote]:italic [&_h1]:mt-8 [&_h1]:mb-5 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:shadow-md [&_li]:pl-2 [&_li]:text-lg [&_li]:leading-8 [&_li]:text-gray-700 [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_p]:mb-5 [&_p]:text-lg [&_p]:leading-8 [&_p]:text-gray-700 [&_strong]:font-bold [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-3"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
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
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-200"
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

        {/* Article Actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Feedback */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="mb-2 font-semibold text-gray-900">Was this article helpful?</h3>

            <div className="flex gap-4">
              <button className="rounded-lg bg-green-50 px-4 py-2 text-green-700 transition hover:bg-green-100">
                Yes 👍
              </button>

              <button className="rounded-lg bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100">
                No 👎
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="mb-2 font-semibold text-gray-900">Need more help?</h3>

            <div className="flex gap-4">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                Contact Support
              </button>

              <button
                onClick={() => window.print()}
                className="rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
              >
                Print Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
