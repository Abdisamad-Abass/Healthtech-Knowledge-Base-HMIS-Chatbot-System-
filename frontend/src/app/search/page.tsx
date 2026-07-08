'use client';

import { useState } from 'react';

import api from '@/lib/api';

export default function Search() {
  const [q, setQ] = useState('');

  const [result, setResult] = useState([]);

  async function search() {
    const res = await api.get(`/search?q=${q}`);

    setResult(res.data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Knowledge Base Search</h1>

          <p className="mt-3 text-gray-500">Find HMIS articles and healthcare documentation</p>
        </div>

        <div className="flex gap-3 rounded-3xl bg-white p-6 shadow-xl">
          <input
            className="flex-1 rounded-2xl border border-gray-300 p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search articles..."
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            onClick={search}
            className="rounded-2xl bg-blue-600 px-8 font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {result.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow">
              No articles found
            </div>
          ) : (
            result.map((x) => (
              <div
                key={x.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                    📚
                  </div>

                  <h2 className="text-xl font-bold text-gray-800">{x.title}</h2>
                </div>

                <p className="mt-4 line-clamp-3 text-gray-600">{x.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
