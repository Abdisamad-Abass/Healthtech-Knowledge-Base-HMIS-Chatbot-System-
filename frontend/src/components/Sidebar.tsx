import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
      className="
      w-64
      min-h-screen
      bg-gradient-to-b
      from-gray-950
      to-gray-800
      text-white
      p-6
      shadow-2xl
      "
    >
      <div
        className="
        mb-10
        "
      >
        <h2
          className="
          text-2xl
          font-extrabold
          "
        >
          Admin Panel
        </h2>

        <p
          className="
          text-sm
          text-gray-400
          mt-2
          "
        >
          HealthTech KBS
        </p>
      </div>

      <div
        className="
        space-y-3
        "
      >
        <Link
          href="/dashboard"
          className="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-blue-600
          transition
          "
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/editor"
          className="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-blue-600
          transition
          "
        >
          ✍️ Create Article
        </Link>

        <Link
          href="/articles"
          className="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-blue-600
          transition
          "
        >
          📚 Articles
        </Link>

        <Link
          href="/search"
          className="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-blue-600
          transition
          "
        >
          🔎 Search
        </Link>
      </div>

      <div
        className="
        mt-16
        bg-white/10
        rounded-2xl
        p-4
        "
      >
        <p className="text-sm text-gray-300">Knowledge Base System</p>

        <p
          className="
          text-xs
          text-gray-400
          mt-2
          "
        >
          AI Powered Healthcare Support
        </p>
      </div>
    </aside>
  );
}
