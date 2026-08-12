'use client';

import {
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
  Save,
  Send,
  Loader2,
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  category: string;
  type: string;
  tags: string;
  product: string;
}

const ARTICLE_TYPES = [
  'HOW_TO',
  'SOP',
  'FAQ',
  'TROUBLESHOOTING',
  'FEATURE_REFERENCE',
  'RELEASE_NOTES',
];

const PRODUCTS = ['HMIS', 'Laboratory', 'Pharmacy', 'Finance', 'HR'];

export default function CreateArticle() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    type: 'FAQ',
    tags: '',
    product: 'HMIS',
  });

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      UnderlineExtension,

      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),

      Image,

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),

      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
    ],

    content: '<p></p>',
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');

        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter an article title.');
      return false;
    }

    if (!editor) {
      alert('Editor is not ready.');
      return false;
    }

    const content = editor.getHTML();

    if (!content || content === '<p></p>' || !editor.getText().trim()) {
      alert('Please write some article content.');
      return false;
    }

    if (!formData.category) {
      alert('Please select a category.');
      return false;
    }

    if (!formData.type) {
      alert('Please select an article type.');
      return false;
    }

    if (!formData.product) {
      alert('Please select a product.');
      return false;
    }

    return true;
  };

  const handleCreate = async (submit = false) => {
    if (loading) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),

        content: editor!.getHTML(),

        type: formData.type,

        category: formData.category,

        product: formData.product,

        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      // Create article as DRAFT
      const response = await api.post('/articles', payload);

      const articleId = response.data.article.id;

      // Submit the newly created draft
      if (submit) {
        await api.put(`/articles/${articleId}/submit`);
      }

      alert(
        submit
          ? 'Article submitted for review successfully.'
          : 'Article saved as draft successfully.',
      );

      // Reset editor
      editor?.commands.clearContent();

      setFormData({
        title: '',
        category: '',
        type: 'FAQ',
        tags: '',
        product: 'HMIS',
      });
    } catch (error: any) {
      console.error('Article creation error:', error);

      alert(error?.response?.data?.message || 'Failed to create article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;

    const url = window.prompt('Enter URL', previousUrl || '');

    if (!url) return;

    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    if (!editor) return;

    const url = window.prompt('Enter image URL');

    if (!url) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
      })
      .run();
  };

  return (
    <div className="min-h-screen pb-10">
      {/* HEADER */}
      <div className="border-border flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-bold">Create New Article</h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Create knowledge base content and submit it for administrative review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleCreate(false)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Save as draft'}
          </Button>

          <Button onClick={() => handleCreate(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Submitting...' : 'Submit for review'}
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* LEFT SIDE */}
        <div className="min-w-0">
          {/* TITLE */}
          <div>
            <Label className="mb-2" required>
              Article title
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. How to Reset HMIS Password"
              className="h-12 text-base"
            />
          </div>

          {/* EDITOR */}
          <Card className="mt-6">
            <CardHeader>
              <Label className="text-base" required>
                Article content
              </Label>
              <CardDescription>
                Write and format the content for your knowledge base article.
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-hidden p-0">
              {/* TOOLBAR */}
              <div className="border-border bg-muted flex flex-wrap items-center gap-1 border-b p-3">
                {/* UNDO */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                  className="rounded-lg p-2 transition hover:bg-gray-200"
                  title="Undo"
                >
                  <Undo2 size={18} />
                </button>

                {/* REDO */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  className="rounded-lg p-2 transition hover:bg-gray-200"
                  title="Redo"
                >
                  <Redo2 size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                {/* BOLD */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Bold"
                >
                  <Bold size={18} />
                </button>

                {/* ITALIC */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Italic"
                >
                  <Italic size={18} />
                </button>

                {/* UNDERLINE */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Underline"
                >
                  <Underline size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                {/* HEADING 1 */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  title="Heading 1"
                >
                  <Heading1 size={18} />
                </button>

                {/* HEADING 2 */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  title="Heading 2"
                >
                  <Heading2 size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                {/* BULLET LIST */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Bullet List"
                >
                  <List size={18} />
                </button>

                {/* ORDERED LIST */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={18} />
                </button>

                {/* QUOTE */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('blockquote') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Quote"
                >
                  <Quote size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                {/* ALIGN LEFT */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'left' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </button>

                {/* ALIGN CENTER */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'center' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={18} />
                </button>

                {/* ALIGN RIGHT */}
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive({ textAlign: 'right' })
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </button>

                <div className="mx-1 h-6 w-px bg-gray-300" />

                {/* LINK */}
                <button
                  type="button"
                  onClick={addLink}
                  className={`rounded-lg p-2 transition ${
                    editor?.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                  title="Add Link"
                >
                  <Link size={18} />
                </button>

                {/* IMAGE */}
                <button
                  type="button"
                  onClick={addImage}
                  className="rounded-lg p-2 transition hover:bg-blue-100"
                  title="Add Image"
                >
                  <ImagePlus size={18} />
                </button>
              </div>

              {/* EDITOR CONTENT */}
              <EditorContent
                editor={editor}
                className="prose prose-neutral dark:prose-invert [&_.ProseMirror]:text-foreground [&_.ProseMirror_h1]:text-foreground [&_.ProseMirror_h2]:text-foreground [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:bg-primary-soft [&_.ProseMirror_blockquote]:text-foreground max-w-none p-6 [&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:outline-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE - METADATA */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Article metadata</CardTitle>
            <CardDescription>
              Add information to help organize and search this article.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* CATEGORY */}
            <div className="flex flex-col gap-2">
              <Label required>Category</Label>

              <Select
                value={formData.category}
                onValueChange={(value) => updateField('category', value ?? '')}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-gray-300">
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

            {/* PRODUCT */}
            <div className="mt-5 flex flex-col gap-2">
              <Label required>Product</Label>

              <Select
                value={formData.product}
                onValueChange={(value) => updateField('product', value ?? 'HMIS')}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-gray-300">
                  <SelectValue placeholder="Select product" />
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

            {/* ARTICLE TYPE */}
            <div className="mt-5 flex flex-col gap-2">
              <Label required>Article Type</Label>

              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value ?? 'FAQ')}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-gray-300">
                  <SelectValue placeholder="Select article type" />
                </SelectTrigger>

                <SelectContent>
                  {ARTICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TAGS */}
            <div className="mt-5 flex flex-col gap-2">
              <Label required>Tags</Label>

              <Input
                value={formData.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                placeholder="password, login, account"
              />

              <p className="text-muted-foreground text-shadow-xs">
                Separate multiple tags using commas.
              </p>
            </div>

            {/* WORKFLOW INFO */}
            <div className="border-info-border bg-info-bg rounded-xl border p-4">
              <h3 className="text-info text-sm font-semibold">Editorial Workflow</h3>

              <div className="text-foreground mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-status-draft h-2 w-2 rounded-full" />
                  Save as Draft
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-status-submitted h-2 w-2 rounded-full" />
                  Submit for Review
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-status-in-review h-2 w-2 rounded-full" />
                  Admin Review
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-status-published h-2 w-2 rounded-full" />
                  Approval & Publication
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
