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
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create New Article</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create knowledge base content and submit it for administrative review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SAVE DRAFT */}
          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}

            {loading ? 'Saving...' : 'Save as Draft'}
          </button>

          {/* SUBMIT */}
          <button
            type="button"
            onClick={() => handleCreate(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}

            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* LEFT SIDE */}
        <div className="min-w-0">
          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Article Title</label>

            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="e.g. How to Reset HMIS Password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg shadow-sm transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* EDITOR */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Article Content
            </label>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-3">
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
                className="prose max-w-none p-6 [&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:cursor-text [&_.ProseMirror]:outline-none [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_h1]:my-4 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:my-3 [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:leading-7 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - METADATA */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Article Metadata</h2>

            <p className="mt-1 text-xs text-gray-500">
              Add information to help organize and search this article.
            </p>
          </div>

          {/* CATEGORY */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>

            <Select
              value={formData.category}
              onValueChange={(value) => updateField('category', value)}
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
            <label className="text-sm font-semibold text-gray-700">Product</label>

            <Select
              value={formData.product}
              onValueChange={(value) => updateField('product', value)}
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
            <label className="text-sm font-semibold text-gray-700">Article Type</label>

            <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
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
            <label className="text-sm font-semibold text-gray-700">Tags</label>

            <input
              type="text"
              value={formData.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="password, login, account"
              className="h-11 rounded-xl border border-gray-300 px-3 text-sm transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <p className="text-xs text-gray-400">Separate multiple tags using commas.</p>
          </div>

          {/* WORKFLOW INFO */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">Editorial Workflow</h3>

            <div className="mt-3 space-y-2 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                Save as Draft
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Submit for Review
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Admin Review
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Approval & Publication
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
