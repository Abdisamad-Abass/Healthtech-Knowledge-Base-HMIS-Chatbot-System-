'use client';

import {
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImagePlus,
  Heading1,
  Heading2,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

export default function CreateArticle() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: '',
    tags: '',
    product: '',
  });
  // In your CreateArticle component, update the editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });
  const [categories, setCategories] = useState<Category[]>([]);
  /* article types */
  const ARTICLE_TYPES = [
    'HOW_TO',
    'SOP',
    'FAQ',
    'TROUBLESHOOTING',
    'FEATURE_REFERENCE',
    'RELEASE_NOTES',
  ];
  /* article products */
  const PRODUCTS = ['HMIS', 'Laboratory', 'Pharmacy', 'Finance', 'HR'];
  /* fetch categories */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);
  /* create article(POST) */
  const handleCreate = async (submit = false) => {
    if (!editor) return;

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        content: editor.getHTML(),
        type: formData.type,
        category: formData.category,
        product: formData.product,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const res = await api.post('/articles', payload);

      if (submit) {
        await api.put(`/articles/${res.data.article.id}/submit`);
      }

      alert(submit ? 'Article submitted for review.' : 'Article saved successfully.');

      editor.commands.clearContent();

      setFormData({
        title: '',
        category: '',
        type: 'FAQ',
        tags: '',
        product: 'HMIS',
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-xl font-bold">Create New Article</h1>
          <p className="text-sm text-gray-400">
            Populate the knowledge base with fresh insights and documentation.
          </p>
        </header>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreate(false)}
            disabled={loading}
            className="rounded-lg bg-gray-300 px-3 py-1 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleCreate(true)}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* 1 & 2 column */}
      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_260px]">
        {/* 1 column */}
        <div className="min-w-0 px-4">
          {/*title */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">Article Title</label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="e.g. How to Reset HMIS Password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg shadow-sm transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          {/* Content */}
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-700">Article Content</label>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 border-b bg-gradient-to-r from-slate-50 to-blue-50 p-3">
                <button onClick={() => editor?.chain().focus().undo().run()}>
                  <Undo2 size={18} />
                </button>

                <button onClick={() => editor?.chain().focus().redo().run()}>
                  <Redo2 size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`rounded-lg p-2 ${
                    editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <Bold size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <Italic size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <Underline size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  <Heading1 size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  <Heading2 size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <List size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <ListOrdered size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('blockquote') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  <Quote size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'left' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  <AlignLeft size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'center' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  <AlignCenter size={18} />
                </button>

                <button
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'right' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  <AlignRight size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    if (!editor) return;

                    const url = window.prompt('Enter URL');

                    if (!url) return;

                    if (editor.state.selection.empty) {
                      editor
                        .chain()
                        .focus()
                        .insertContent(`<a href="${url}" target="_blank">${url}</a>`)
                        .run();
                    } else {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  <Link size={18} />
                </button>

                <button
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('image') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    const url = window.prompt('Image URL');

                    if (url) {
                      editor?.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                >
                  <ImagePlus size={18} />
                </button>
              </div>

              {/* Editor */}
              <EditorContent
                editor={editor}
                className="prose max-w-none p-6 [&_.ProseMirror]:min-h-80 [&_.ProseMirror]:cursor-text [&_.ProseMirror]:border-0 [&_.ProseMirror]:outline-none [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_h1]:my-4 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:my-3 [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:leading-snug [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:text-base [&_.ProseMirror_p]:leading-7 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
              />
            </div>
          </div>
        </div>

        {/* 2 column */}
        <div className="rounded-2xl border border-gray-200 bg-blue-300 p-3 shadow-sm">
          <div className="">
            <h1 className="text-lg font-bold">Article Metadata</h1>
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">Category</label>

              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value ?? '',
                  })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 shadow-none">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product */}
            <div className="mt-2 flex flex-col gap-1">
              <label className="font-medium text-gray-700">Product</label>

              <Select
                value={formData.product}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    product: value ?? '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Article Type */}
            <div className="mt-2 flex flex-col gap-2">
              <label className="font-medium text-gray-700">Article Type </label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value ?? '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Tags */}
            <div className="mt-2 flex flex-col gap-2">
              <label>Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value,
                  })
                }
                placeholder="Enter related Tags"
                className="rounded-lg border border-gray-500 px-4 py-1 outline-0 focus:border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Urgency Level */}
            <div className="mt-4">
              <label className="mb-2 block font-semibold text-gray-700">Urgency</label>

              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-500 bg-gray-300 p-1.5 transition hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="LOW"
                    className="h-4 w-4 accent-green-600"
                  />
                  <span className="font-medium text-gray-700">Low</span>
                </label>

                <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-blue-400 bg-blue-100 p-1.5 transition hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="MEDIUM"
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span className="font-medium text-gray-700">Medium</span>
                </label>

                <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-300 bg-red-100 p-1.5 transition hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="HIGH"
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="font-medium text-gray-700">High</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
