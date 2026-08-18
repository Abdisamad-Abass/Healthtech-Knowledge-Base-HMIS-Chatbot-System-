'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  content: string;
}

export default function Search() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult[]>([]);

  async function search() {
    try {
      const res = await api.get<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`);
      setResult(res.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResult([]);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-foreground text-4xl font-bold">Knowledge Base Search</h1>
          <p className="text-card-FOREGROUND0 mt-3">
            Find HMIS articles and healthcare documentation
          </p>
        </div>

        <div className="bg-card flex gap-3 rounded-3xl p-6 shadow-xl">
          <input
            className="text-foreground border-border flex-1 rounded-2xl border p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search articles..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            onClick={search}
            className="text-primary-foreground bg-primary hover:bg-primary rounded-2xl px-8 font-semibold shadow-lg transition"
          >
            Search
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {result.length === 0 ? (
            <div className="bg-card text-card-FOREGROUND0 rounded-2xl p-8 text-center shadow">
              No articles found
            </div>
          ) : (
            result.map((x) => (
              <div
                key={x.id}
                className="bg-card border-border rounded-2xl border p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-accent flex h-12 w-12 items-center justify-center rounded-full text-xl">
                    📚
                  </div>

                  <h2 className="text-foreground text-xl font-bold">{x.title}</h2>
                </div>

                <p className="text-muted-FOREGROUND mt-4 line-clamp-3">{x.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
