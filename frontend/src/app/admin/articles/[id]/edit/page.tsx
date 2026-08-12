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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
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
    return () => {
      editor?.destroy();
    };
  }, [editor]);

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

  /* Add tag */

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

  /* Loading */
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary animate-spin" size={38} />

          <p className="text-muted-foreground text-sm">Loading article...</p>
        </div>
      </div>
    );
  }

  /* Error */
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

  /* Permission denied */
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

  /* status colors */
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'badge badge-draft';
      case 'SUBMITTED':
        return 'badge badge-submitted';
      case 'IN_REVIEW':
        return 'badge badge-in-review';
      case 'APPROVED':
        return 'badge badge-approved';
      case 'PUBLISHED':
        return 'badge badge-published';
      case 'REJECTED':
        return 'badge badge-rejected';
      case 'ARCHIVED':
        return 'badge badge-archived';
      case 'DELETED':
        return 'badge badge-deleted';
      default:
        return 'badge badge-draft';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/admin/articles/${article.id}`}
              className="text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-2 text-sm font-medium transition"
            >
              <ArrowLeft size={17} />
              Back to Article
            </Link>

            <h1 className="text-foreground text-lg font-bold tracking-tight">Edit Article</h1>

            <p className="text-muted-foreground mt-2">
              Update and improve your knowledge base content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={getStatusBadgeClass(article.status)}>
              <span className="badge-dot" />
              {article.status.replaceAll('_', ' ')}
            </span>

            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </Button>
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
            <Card className="rounded-2xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="bg-accent text-primary rounded-xl p-3">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className="text-foreground font-bold">Article Content</h2>

                  <p className="text-muted-foreground text-sm">
                    Create clear and useful documentation.
                  </p>
                </div>
              </div>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Article title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>

                <div className="mt-5">
                  <label className="text-foreground mb-2 block text-sm font-semibold">
                    Content
                  </label>

                  <div className="border-border bg-card overflow-hidden rounded-xl border">
                    {/* Toolbar */}
                    <div className="border-border bg-accent flex flex-wrap items-center gap-2 border-b p-3">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().undo().run()}
                        className="hover:bg-accent rounded-lg p-2"
                      >
                        <Undo2 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().redo().run()}
                        className="hover:bg-accent rounded-lg p-2"
                      >
                        <Redo2 size={18} />
                      </button>

                      <div className="mx-1 h-6 w-px bg-gray-300" />

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('bold')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Bold size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('italic')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Italic size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('underline')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
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
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Heading1 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('heading', { level: 2 })
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
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
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <List size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('orderedList')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <ListOrdered size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        className={`rounded-lg p-2 ${
                          editor?.isActive('blockquote')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Quote size={18} />
                      </button>

                      <div className="mx-1 h-6 w-px bg-gray-300" />

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                        className="hover:bg-accent rounded-lg p-2"
                      >
                        <AlignLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                        className="hover:bg-accent rounded-lg p-2"
                      >
                        <AlignCenter size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                        className="hover:bg-accent rounded-lg p-2"
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
                        className="hover:bg-accent rounded-lg p-2"
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
                        className="hover:bg-accent rounded-lg p-2"
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

                  <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                    <span>Use clear headings, steps, and explanations.</span>

                    <span>{editor?.getText().length.toLocaleString() || 0} characters</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="rounded-2xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Tag size={21} />
                </div>

                <div>
                  <h2 className="text-foreground font-bold">Article Tags</h2>

                  <p className="text-muted-foreground text-sm">
                    Add keywords to improve article discovery.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Add tags</Label>

                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                  />

                  <Button type="button" className="px-5" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <p className="text-muted-foreground text-sm">No tags added.</p>
                )}

                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent text-primary inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-accent rounded-full transition"
                    >
                      <X size={15} />
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Publishing Information */}
            <Card className="rounded-2xl p-6">
              <h2 className="text-foreground mb-5 font-bold">Article Information</h2>

              {/* Type */}
              <div className="mb-5">
                <Label className="mb-2 flex items-center gap-2" htmlFor="type">
                  <FileText size={16} className="text-primary size-4" />
                  Article Type
                </Label>

                <Select value={type} onValueChange={(value) => setType(value ?? 'FAQ')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select article type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_TYPES.map((articleType) => (
                      <SelectItem key={articleType} value={articleType}>
                        {articleType.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="mb-5">
                <Label className="mb-2 flex items-center gap-2" htmlFor="category">
                  <FolderOpen size={16} className="text-primary size-4" />
                  Category
                </Label>

                <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category">
                      {categories.find((c) => c.id === categoryId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label className="mb-2 flex items-center gap-2" htmlFor="product">
                  <Package className="text-primary size-4" />
                  Product
                </Label>
                <Input
                  id="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. HMIS, HR System, Laboratory Module"
                />
              </div>
            </Card>

            {/* Article Details */}
            <Card className="rounded-2xl p-6">
              <h2 className="text-foreground mb-5 font-bold">Article Details</h2>

              <div className="divide-border divide-y text-sm">
                <div className="space-y-2 pb-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Article ID
                  </p>
                  <p className="text-foreground font-medium break-all">{article.id}</p>
                </div>

                <div className="space-y-2 py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Slug
                  </p>
                  <p className="text-foreground font-medium break-all">{article.slug}</p>
                </div>

                <div className="space-y-2 py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Created by
                  </p>
                  <p className="text-foreground font-medium">{article.author.name}</p>
                  <p className="text-muted-foreground text-xs">{article.author.email}</p>
                </div>

                <div className="space-y-2 pt-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Status
                  </p>
                  <span className={getStatusBadgeClass(article.status)}>
                    <span className="badge-dot" />
                    {article.status.replaceAll('_', ' ')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Save Card */}
            <Card className="border-primary/20 bg-primary text-primary-foreground rounded-2xl p-6">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Ready to save?</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Your changes will be saved and a new article version will be created
                  automatically.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="secondary"
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
