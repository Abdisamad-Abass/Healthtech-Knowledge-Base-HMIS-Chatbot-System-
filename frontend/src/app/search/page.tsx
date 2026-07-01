"use client";

import { useState } from "react";

import api from "@/lib/api";

export default function Search() {
  const [q, setQ] = useState("");

  const [result, setResult] = useState([]);

  async function search() {
    const res = await api.get(`/search?q=${q}`);

    setResult(res.data);
  }

  return (
    <div
      className="
      min-h-screen
      bg-gradient-to-br
      from-blue-50
      via-white
      to-blue-100
      p-6
      "
    >
      <div
        className="
        max-w-5xl
        mx-auto
        "
      >
        <div className="text-center mb-10">
          <h1
            className="
            text-4xl
            font-bold
            text-gray-800
            "
          >
            Knowledge Base Search
          </h1>

          <p
            className="
            mt-3
            text-gray-500
            "
          >
            Find HMIS articles and healthcare documentation
          </p>
        </div>

        <div
          className="
          bg-white
          shadow-xl
          rounded-3xl
          p-6
          flex
          gap-3
          "
        >
          <input
            className="text-gray-700
            flex-1
            border
            border-gray-300
            p-4
            rounded-2xl
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            "
            placeholder="Search articles..."
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            onClick={search}
            className="
            bg-blue-600
            hover:bg-blue-700
            transition
            text-white
            px-8
            rounded-2xl
            font-semibold
            shadow-lg
            "
          >
            Search
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {result.length === 0 ? (
            <div
              className="
              bg-white
              rounded-2xl
              shadow
              p-8
              text-center
              text-gray-500
              "
            >
              No articles found
            </div>
          ) : (
            result.map((x) => (
              <div
                key={x.id}
                className="
                bg-white
                rounded-2xl
                shadow-lg
                p-6
                hover:shadow-xl
                transition
                border
                border-gray-100
                "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >
                  <div
                    className="
                    w-12
                    h-12
                    rounded-full
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    text-xl
                    "
                  >
                    📚
                  </div>

                  <h2
                    className="
                    text-xl
                    font-bold
                    text-gray-800
                    "
                  >
                    {x.title}
                  </h2>
                </div>

                <p
                  className="
                  mt-4
                  text-gray-600
                  line-clamp-3
                  "
                >
                  {x.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
