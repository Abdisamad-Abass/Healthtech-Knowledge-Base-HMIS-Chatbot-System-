'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    const res = await api.get('/articles');

    setRole(res.data.role);

    setArticles(res.data.articles);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Knowledge Base</h1>

          <div className="rounded-full bg-blue-600 px-5 py-2 text-white">Role: {role}</div>
        </div>

        {role === 'EDITOR' || role === 'ADMIN' ? (
          <a
            href="/editor"
            className="mb-6 inline-block rounded-xl bg-green-600 px-6 py-3 text-white"
          >
            + Create Article
          </a>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <div key={a.id} className="rounded-3xl border bg-white p-7 shadow-xl">
              <h2 className="text-xl font-bold">{a.title}</h2>

              <p className="mt-3 text-gray-600">{a.content.substring(0, 120)}...</p>

              <div className="mt-5 space-y-2 text-sm">
                <p>
                  Category:
                  {a.category?.name}
                </p>

                <p>
                  Author:
                  {a.author?.name}
                </p>

                <p>
                  Status:
                  <span className="font-bold">{a.status}</span>
                </p>
              </div>

              <a href={`/articles/${a.id}`} className="mt-5 inline-block text-blue-600">
                Read Article →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
