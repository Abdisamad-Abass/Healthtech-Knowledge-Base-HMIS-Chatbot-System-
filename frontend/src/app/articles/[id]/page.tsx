"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import { useParams } from "next/navigation";

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
    <div
      className="
min-h-screen
bg-gradient-to-br
from-blue-50
to-white
p-10
"
    >
      <div
        className="
max-w-5xl
mx-auto
bg-white
rounded-3xl
shadow-xl
p-10
"
      >
        <h1
          className="
text-4xl
font-bold
"
        >
          {article.title}
        </h1>

        <div
          className="
mt-5
text-gray-600
space-y-2
"
        >
          <p>📂 {article.category?.name}</p>

          <p>👤 {article.author?.name}</p>

          <p>👁 {article.views} views</p>
        </div>

        <hr className="my-8" />

        <p
          className="
whitespace-pre-line
leading-relaxed
text-lg
"
        >
          {article.content}
        </p>
      </div>
    </div>
  );
}
