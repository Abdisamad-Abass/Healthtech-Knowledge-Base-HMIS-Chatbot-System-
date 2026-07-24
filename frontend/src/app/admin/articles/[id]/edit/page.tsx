'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import {
  ArrowLeft,
  Save,
  FileText,
  Tag,
  FolderOpen,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImagePlus,
  Heading1,
  Heading2,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface TagType {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  product: string | null;
  status: string;
  categoryId: string | null;
  category: Category | null;
  tags: TagType[];
  author: Author;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

const ARTICLE_TYPES = [
  'HOW_TO',
  'SOP',
  'FAQ',
  'TROUBLESHOOTING',
  'FEATURE_REFERENCE',
  'RELEASE_NOTES',
];

const editableStatuses = ['DRAFT', 'SUBMITTED', 'REJECTED', 'IN_REVIEW'];

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [title, setTitle] = useState('');
  //const [content, setContent] = useState('');
  const [type, setType] = useState('FAQ');
  const [product, setProduct] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    content: '',

    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none',
      },
    },
  });

  /* Fetch current user */

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        console.error('Invalid user data');
      }
    }
  }, []);

  /* Fetch article and categories */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [articleResponse, categoriesResponse] = await Promise.all([
          api.get<Article>(`/articles/${articleId}`),
          api.get<Category[]>('/categories'),
        ]);

        const fetchedArticle = articleResponse.data;

        setArticle(fetchedArticle);
        setCategories(categoriesResponse.data);

        setTitle(fetchedArticle.title);
        setType(fetchedArticle.type);
        setProduct(fetchedArticle.product || '');
        setCategoryId(fetchedArticle.categoryId || '');

        setTags(fetchedArticle.tags?.map((tag) => tag.name) || []);
      } catch (err: any) {
        console.error(err);

        setError(err?.response?.data?.message || 'Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadData();
    }
  }, [articleId]);

  useEffect(() => {
    if (editor && article?.content) {
      editor.commands.setContent(article.content);
    }
  }, [editor, article]);

  /* Permission logic */

  const canEdit = useMemo(() => {
    if (!article || !currentUser) return false;

    // Admin can edit any article except permanently blocked statuses
    if (currentUser.role === 'ADMIN') {
      return !['PUBLISHED', 'ARCHIVED', 'DELETED'].includes(article.status);
    }

    // Editor can only edit their own articles
    if (currentUser.role === 'EDITOR') {
      const isOwner = article.author.id === currentUser.id;

      const isEditableStatus = editableStatuses.includes(article.status);

      return isOwner && isEditableStatus;
    }

    return false;
  }, [article, currentUser]);

  /*
  |--------------------------------------------------------------------------
  | Add tag
  |--------------------------------------------------------------------------
  */

  const addTag = () => {
    const cleanTag = tagInput.trim();

    if (!cleanTag) return;

    if (tags.some((tag) => tag.toLowerCase() === cleanTag.toLowerCase())) {
      setTagInput('');
      return;
    }

    setTags((prev) => [...prev, cleanTag]);
    setTagInput('');
  };

  /* Remove tag */

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  /* Handle tag Enter*/

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  /* Save article */

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }

    if (!editor || editor.isEmpty) {
      setError('Article content is required.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put(`/articles/${articleId}`, {
        title: title.trim(),
        content: editor.getHTML(),
        type,
        product: product.trim() || null,
        categoryId,
        tags,
      });

      setSuccess('Article updated successfully.');

      setTimeout(() => {
        router.push(`/admin/articles/${articleId}`);
      }, 1000);
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.message || 'Failed to update article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={38} />

          <p className="text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error && !article) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={42} />

          <h2 className="text-xl font-bold text-red-800">Unable to Load Article</h2>

          <p className="mt-2 text-red-700">{error}</p>

          <Link
            href="/admin/articles"
            className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (!article) return null;

  /*
  |--------------------------------------------------------------------------
  | Permission denied
  |--------------------------------------------------------------------------
  */

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-5 text-amber-600" size={50} />

          <h1 className="text-2xl font-bold text-gray-900">Editing Not Allowed</h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            You do not have permission to edit this article.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-xl bg-white p-4 text-left text-sm">
            <p>
              <strong>Article owner:</strong> {article.author.name}
            </p>

            <p className="mt-2">
              <strong>Current status:</strong> {article.status}
            </p>

            <p className="mt-2">
              <strong>Your role:</strong> {currentUser?.role}
            </p>
          </div>

          <Link
            href={`/admin/articles/${article.id}`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            View Article
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/admin/articles/${article.id}`}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Article
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Article</h1>

            <p className="mt-2 text-gray-500">Update and improve your knowledge base content.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {article.status}
            </span>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <AlertCircle size={20} />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            <CheckCircle2 size={20} />

            <span>{success}</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Editor */}
          <main className="space-y-6">
            {/* Title */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Article Content</h2>

                  <p className="text-sm text-gray-500">Create clear and useful documentation.</p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Article Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-medium transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Content</label>

                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 border-b bg-gradient-to-r from-slate-50 to-blue-50 p-3">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().undo().run()}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <Undo2 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().redo().run()}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <Redo2 size={18} />
                    </button>

                    <div className="mx-1 h-6 w-px bg-gray-300" />

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                      }`}
                    >
                      <Bold size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                      }`}
                    >
                      <Italic size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('underline')
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <Underline size={18} />
                    </button>

                    <div className="mx-1 h-6 w-px bg-gray-300" />

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('heading', { level: 1 })
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <Heading1 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('heading', { level: 2 })
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <Heading2 size={18} />
                    </button>

                    <div className="mx-1 h-6 w-px bg-gray-300" />

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('bulletList')
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <List size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('orderedList')
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <ListOrdered size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      className={`rounded-lg p-2 ${
                        editor?.isActive('blockquote')
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <Quote size={18} />
                    </button>

                    <div className="mx-1 h-6 w-px bg-gray-300" />

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <AlignLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <AlignCenter size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <AlignRight size={18} />
                    </button>

                    <div className="mx-1 h-6 w-px bg-gray-300" />

                    <button
                      type="button"
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
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <LinkIcon size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt('Image URL');

                        if (url) {
                          editor?.chain().focus().setImage({ src: url }).run();
                        }
                      }}
                      className="rounded-lg p-2 hover:bg-blue-100"
                    >
                      <ImagePlus size={18} />
                    </button>
                  </div>

                  {/* TipTap Editor */}
                  <EditorContent
                    editor={editor}
                    className="prose max-w-none p-6 [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:cursor-text [&_.ProseMirror]:border-0 [&_.ProseMirror]:outline-none [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_h1]:my-4 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:my-3 [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:leading-7 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-400">
                  <span>Use clear headings, steps, and explanations.</span>

                  <span>{editor?.getText().length.toLocaleString() || 0} characters</span>
                </div>
              </div>
            </section>

            {/* Tags */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Tag size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Article Tags</h2>

                  <p className="text-sm text-gray-500">
                    Add keywords to improve article discovery.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter..."
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length === 0 && <p className="text-sm text-gray-400">No tags added.</p>}

                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full transition hover:bg-blue-200"
                    >
                      <X size={15} />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Publishing Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-gray-900">Article Information</h2>

              {/* Type */}
              <div className="mb-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText size={16} />
                  Article Type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {ARTICLE_TYPES.map((articleType) => (
                    <option key={articleType} value={articleType}>
                      {articleType.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FolderOpen size={16} />
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package size={16} />
                  Product
                </label>

                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. HMIS, HR System..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </section>

            {/* Article Details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-gray-900">Article Details</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Article ID</p>

                  <p className="mt-1 font-medium break-all text-gray-800">{article.id}</p>
                </div>

                <div>
                  <p className="text-gray-500">Slug</p>

                  <p className="mt-1 font-medium break-all text-gray-800">{article.slug}</p>
                </div>

                <div>
                  <p className="text-gray-500">Created By</p>

                  <p className="mt-1 font-medium text-gray-800">{article.author.name}</p>

                  <p className="text-xs text-gray-500">{article.author.email}</p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>

                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {article.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Save Card */}
            <section className="rounded-2xl bg-gray-900 p-6 text-white shadow-lg">
              <h2 className="font-bold">Ready to save?</h2>

              <p className="mt-2 text-sm leading-6 text-gray-300">
                Your changes will be saved and a new article version will be created automatically.
              </p>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
