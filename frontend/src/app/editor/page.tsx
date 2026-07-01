"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Editor() {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    type: "FAQ",
    category: "",
    product: "",
    tags: "",
    content: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  const save = async () => {
    if (!form.title || !form.content) {
      alert("Title and content required");
      return;
    }

    const payload = {
      title: form.title,
      type: form.type,
      category: form.category,
      product: form.product,
      content: form.content,
      tags: form.tags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    };

    await api.post("/articles", payload);

    alert("Article saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Knowledge Base Editor
          </h1>

          <p className="text-gray-500 mt-2">
            Create and manage healthcare knowledge articles
          </p>
        </div>

        <div
          className="
          bg-white
          rounded-3xl
          shadow-xl
          border
          border-gray-200
          p-8
        "
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Article Title
              </label>

              <input
                className="
                w-full
                mt-2
                rounded-xl
                border
                p-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
                "
                placeholder="Enter article title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Article Type
              </label>

              <select
                className="
                w-full
                mt-2
                rounded-xl
                border
                p-4
                focus:ring-2
                focus:ring-blue-500
                "
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>FAQ</option>
                <option>HOW_TO</option>
                <option>SOP</option>
                <option>TROUBLESHOOTING</option>
                <option>FEATURE_REFERENCE</option>
                <option>RELEASE_NOTES</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Category
              </label>

              <select
                className="
                w-full
                mt-2
                rounded-xl
                border
                p-4
                focus:ring-2
                focus:ring-blue-500
                "
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>

                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Product Module
              </label>

              <input
                className="
                w-full
                mt-2
                rounded-xl
                border
                p-4
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="Example: HMIS"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tags
              </label>

              <input
                className="
                w-full
                mt-2
                rounded-xl
                border
                p-4
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="HMIS,password,login"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Article Content
              </label>

              <textarea
                className="
                w-full
                mt-2
                h-80
                rounded-xl
                border
                p-5
                resize-none
                outline-none
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="
Write article content here...

Example:

Question:
How do I reset password?

Steps:
1. Open login page
2. Click forgot password
                "
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={save}
            className="
            mt-8
            w-full
            bg-gradient-to-r
            from-blue-600
            to-indigo-600
            hover:from-blue-700
            hover:to-indigo-700
            text-white
            py-4
            rounded-xl
            font-bold
            text-lg
            shadow-lg
            transition
            active:scale-95
            "
          >
            🚀 Create Knowledge Article
          </button>
        </div>
      </div>
    </div>
  );
}
