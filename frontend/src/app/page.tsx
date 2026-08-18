import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <section className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="bg-accent text-primary mb-6 inline-flex items-center rounded-full px-5 py-2 font-medium">
              🚀 HealthTech AI Platform
            </div>

            <h1 className="text-foreground text-5xl leading-tight font-extrabold md:text-6xl">
              HealthTech Knowledge Base
              <span className="text-primary"> Assistant</span>
            </h1>

            <p className="text-muted-FOREGROUND mt-6 max-w-xl text-lg leading-relaxed">
              Centralized healthcare documentation platform with AI powered HMIS chatbot support.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="text-primary-foreground bg-primary hover:bg-primary rounded-2xl px-8 py-4 font-semibold shadow-lg transition"
              >
                Login
              </Link>

              <Link
                href="/search"
                className="hover:bg-primary-soft text-primary bg-card rounded-2xl border-2 border-blue-600 px-8 py-4 font-semibold transition"
              >
                Search Knowledge Base
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl p-4 shadow">
                <h3 className="text-primary text-xl font-bold">AI</h3>

                <p className="text-card-FOREGROUND0 text-sm">Assistant</p>
              </div>

              <div className="bg-card rounded-2xl p-4 shadow">
                <h3 className="text-status-PUBLISHED text-xl font-bold">HMIS</h3>

                <p className="text-card-FOREGROUND0 text-sm">Support</p>
              </div>

              <div className="bg-card rounded-2xl p-4 shadow">
                <h3 className="text-xl font-bold text-purple-600">KB</h3>

                <p className="text-card-FOREGROUND0 text-sm">Search</p>
              </div>
            </div>
          </div>

          <div className="bg-card/90 border-border rounded-3xl border p-10 shadow-2xl backdrop-blur">
            <div className="bg-accent mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl">
              🏥
            </div>

            <h2 className="text-foreground text-3xl font-bold">System Features</h2>

            <ul className="text-foreground mt-8 space-y-5">
              <li className="bg-primary-soft rounded-xl p-4">✅ Role Based Access Control</li>

              <li className="bg-primary-soft rounded-xl p-4">✅ Article Management</li>

              <li className="bg-primary-soft rounded-xl p-4">✅ Full Text Search</li>

              <li className="bg-primary-soft rounded-xl p-4">✅ AI Knowledge Assistant</li>

              <li className="bg-primary-soft rounded-xl p-4">✅ HMIS Embedded Widget</li>
            </ul>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}
