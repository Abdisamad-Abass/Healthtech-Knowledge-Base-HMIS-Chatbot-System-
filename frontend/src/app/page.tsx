import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* HERO CONTENT */}
          <div className="animate-fade-in-up">
            {/* Platform Badge */}
            <div className="bg-accent text-accent-foreground border-border mb-6 inline-flex items-center rounded-full border px-5 py-2 font-medium shadow-sm">
              🚀 HealthTech AI Platform
            </div>

            {/* Heading */}
            <h1 className="text-foreground text-5xl leading-tight font-extrabold md:text-6xl">
              HealthTech Knowledge Base
              <span className="text-primary"> Assistant</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              Centralized healthcare documentation platform with AI-powered HMIS chatbot support.
            </p>

            {/* Actions */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-2xl px-8 py-4 font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                Login
              </Link>

              <Link
                href="/search"
                className="bg-card text-primary hover:bg-primary-soft border-primary rounded-2xl border-2 px-8 py-4 font-semibold transition-all duration-200 hover:-translate-y-0.5"
              >
                Search Knowledge Base
              </Link>
            </div>

            {/* System Highlights */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {/* AI */}
              <div className="bg-card border-border rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-primary text-xl font-bold">AI</h3>

                <p className="text-card-foreground text-sm">Assistant</p>
              </div>

              {/* HMIS */}
              <div className="bg-card border-border rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-success text-xl font-bold">HMIS</h3>

                <p className="text-card-foreground text-sm">Support</p>
              </div>

              {/* Knowledge Base */}
              <div className="bg-card border-border rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-info text-xl font-bold">KB</h3>

                <p className="text-card-foreground text-sm">Search</p>
              </div>
            </div>
          </div>

          {/* FEATURES CARD */}
          <div className="bg-card border-border rounded-3xl border p-10 shadow-xl backdrop-blur transition-all duration-300 hover:shadow-2xl">
            {/* Icon */}
            <div className="bg-primary-soft text-primary border-border mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl">
              🏥
            </div>

            {/* Heading */}
            <h2 className="text-foreground text-3xl font-bold">System Features</h2>

            {/* Features */}
            <ul className="mt-8 space-y-4">
              <li className="bg-primary-soft text-foreground border-border hover:border-primary rounded-xl border p-4 transition-all duration-200">
                <span className="text-success mr-2">✓</span>
                Role Based Access Control
              </li>

              <li className="bg-primary-soft text-foreground border-border hover:border-primary rounded-xl border p-4 transition-all duration-200">
                <span className="text-success mr-2">✓</span>
                Article Management
              </li>

              <li className="bg-primary-soft text-foreground border-border hover:border-primary rounded-xl border p-4 transition-all duration-200">
                <span className="text-success mr-2">✓</span>
                Full Text Search
              </li>

              <li className="bg-primary-soft text-foreground border-border hover:border-primary rounded-xl border p-4 transition-all duration-200">
                <span className="text-success mr-2">✓</span>
                AI Knowledge Assistant
              </li>

              <li className="bg-primary-soft text-foreground border-border hover:border-primary rounded-xl border p-4 transition-all duration-200">
                <span className="text-success mr-2">✓</span>
                HMIS Embedded Widget
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}
