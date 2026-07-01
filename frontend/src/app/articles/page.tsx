"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    const res = await api.get("/articles");

    setRole(res.data.role);

    setArticles(res.data.articles);
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
max-w-6xl
mx-auto
"
      >
        <div
          className="
flex
justify-between
items-center
mb-8
"
        >
          <h1
            className="
text-4xl
font-bold
"
          >
            Knowledge Base
          </h1>

          <div
            className="
bg-blue-600
text-white
px-5
py-2
rounded-full
"
          >
            Role: {role}
          </div>
        </div>

        {role === "EDITOR" || role === "ADMIN" ? (
          <a
            href="/editor"
            className="
bg-green-600
text-white
px-6
py-3
rounded-xl
inline-block
mb-6
"
          >
            + Create Article
          </a>
        ) : null}

        <div
          className="
grid
md:grid-cols-2
gap-6
"
        >
          {articles.map((a) => (
            <div
              key={a.id}
              className="
bg-white
rounded-3xl
shadow-xl
p-7
border
"
            >
              <h2
                className="
text-xl
font-bold
"
              >
                {a.title}
              </h2>

              <p
                className="
text-gray-600
mt-3
"
              >
                {a.content.substring(0, 120)}...
              </p>

              <div
                className="
mt-5
space-y-2
text-sm
"
              >
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
                  <span
                    className="
font-bold
"
                  >
                    {a.status}
                  </span>
                </p>
              </div>

              <a
                href={`/articles/${a.id}`}
                className="
text-blue-600
mt-5
inline-block
"
              >
                Read Article →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
