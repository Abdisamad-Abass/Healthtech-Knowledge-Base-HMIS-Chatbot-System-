import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-gradient-to-b from-gray-950 to-gray-800 p-6 text-white shadow-2xl">
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold">Admin Panel</h2>

        <p className="mt-2 text-sm text-gray-400">HealthTech KBS</p>
      </div>

      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-blue-600"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/editor"
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-blue-600"
        >
          ✍️ Create Article
        </Link>

        <Link
          href="/articles"
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-blue-600"
        >
          📚 Articles
        </Link>

        <Link
          href="/search"
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-blue-600"
        >
          🔎 Search
        </Link>
      </div>

      <div className="mt-16 rounded-2xl bg-white/10 p-4">
        <p className="text-sm text-gray-300">Knowledge Base System</p>

        <p className="mt-2 text-xs text-gray-400">AI Powered Healthcare Support</p>
      </div>
    </aside>
  );
}
