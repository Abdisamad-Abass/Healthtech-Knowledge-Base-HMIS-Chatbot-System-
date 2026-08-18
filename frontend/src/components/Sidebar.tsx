import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="text-primary-foreground min-h-screen w-64 bg-gradient-to-b from-gray-950 to-gray-800 p-6 shadow-2xl">
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold">Admin Panel</h2>

        <p className="text-muted-FOREGROUND mt-2 text-sm">HealthTech KBS</p>
      </div>

      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="hover:bg-primary flex items-center gap-3 rounded-xl px-4 py-3 transition"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/editor"
          className="hover:bg-primary flex items-center gap-3 rounded-xl px-4 py-3 transition"
        >
          ✍️ Create Article
        </Link>

        <Link
          href="/articles"
          className="hover:bg-primary flex items-center gap-3 rounded-xl px-4 py-3 transition"
        >
          📚 Articles
        </Link>

        <Link
          href="/search"
          className="hover:bg-primary flex items-center gap-3 rounded-xl px-4 py-3 transition"
        >
          🔎 Search
        </Link>
      </div>

      <div className="bg-card/10 mt-16 rounded-2xl p-4">
        <p className="text-muted-FOREGROUND text-sm">Knowledge Base System</p>

        <p className="text-muted-FOREGROUND mt-2 text-xs">AI Powered Healthcare Support</p>
      </div>
    </aside>
  );
}
