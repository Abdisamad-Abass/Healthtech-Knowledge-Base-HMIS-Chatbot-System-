import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <section className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-5 py-2 font-medium text-blue-700">
              🚀 HealthTech AI Platform
            </div>

            <h1 className="text-5xl leading-tight font-extrabold text-gray-900 md:text-6xl">
              HealthTech Knowledge Base
              <span className="text-blue-600"> Assistant</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Centralized healthcare documentation platform with AI powered HMIS chatbot support.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                href="/search"
                className="rounded-2xl border-2 border-blue-600 bg-white px-8 py-4 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Search Knowledge Base
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow">
                <h3 className="text-xl font-bold text-blue-600">AI</h3>

                <p className="text-sm text-gray-500">Assistant</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow">
                <h3 className="text-xl font-bold text-green-600">HMIS</h3>

                <p className="text-sm text-gray-500">Support</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow">
                <h3 className="text-xl font-bold text-purple-600">KB</h3>

                <p className="text-sm text-gray-500">Search</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-2xl backdrop-blur">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🏥
            </div>

            <h2 className="text-3xl font-bold text-gray-800">System Features</h2>

            <ul className="mt-8 space-y-5 text-gray-700">
              <li className="rounded-xl bg-blue-50 p-4">✅ Role Based Access Control</li>

              <li className="rounded-xl bg-blue-50 p-4">✅ Article Management</li>

              <li className="rounded-xl bg-blue-50 p-4">✅ Full Text Search</li>

              <li className="rounded-xl bg-blue-50 p-4">✅ AI Knowledge Assistant</li>

              <li className="rounded-xl bg-blue-50 p-4">✅ HMIS Embedded Widget</li>
            </ul>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}
