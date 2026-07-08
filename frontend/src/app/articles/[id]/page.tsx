'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';

import { useParams } from 'next/navigation';

export default function ArticleDetails() {
  const params = useParams();

  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/articles/${params.id}`)

      .then((res) => {
        setArticle(res.data);
      });
  }, [params.id]);

  if (!article) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-bold">{article.title}</h1>

        <div className="mt-5 space-y-2 text-gray-600">
          <p>📂 {article.category?.name}</p>

          <p>👤 {article.author?.name}</p>

          <p>👁 {article.views} views</p>
        </div>

        <hr className="my-8" />

        <p className="text-lg leading-relaxed whitespace-pre-line">{article.content}</p>
      </div>
    </div>
  );
}
