import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Sidebar />

        <div className="flex-1 p-10">
          <div className="mb-10">
            <h1 className="text-foreground text-4xl font-bold">Knowledge Base Dashboard</h1>

            <p className="text-card-FOREGROUND0 mt-3">
              Manage your healthcare knowledge system and AI assistant
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-card border-border rounded-3xl border p-7 shadow-lg transition hover:shadow-xl">
              <div className="bg-accent flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                📚
              </div>

              <Link href="/articles" className="text-foreground mt-5 text-xl font-bold">
                Articles
              </Link>

              <p className="text-card-FOREGROUND0 mt-2">Manage healthcare documentation</p>
            </div>

            <div className="bg-card border-border rounded-3xl border p-7 shadow-lg transition hover:shadow-xl">
              <div className="bg-success-BG flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                👥
              </div>

              <Link href="/users" className="text-foreground mt-5 text-xl font-bold">
                Users
              </Link>

              <p className="text-card-FOREGROUND0 mt-2">Manage system users and roles</p>
            </div>

            <div className="bg-card border-border rounded-3xl border p-7 shadow-lg transition hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                🤖
              </div>

              <Link href="/analytics" className="text-foreground mt-5 text-xl font-bold">
                Analytics
              </Link>

              <p className="text-card-FOREGROUND0 mt-2">Monitor AI assistant conversations</p>
            </div>
          </div>

          <div className="bg-card mt-10 rounded-3xl p-8 shadow-lg">
            <h2 className="text-foreground text-2xl font-bold">System Overview</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-4">
              <div className="bg-primary-soft rounded-2xl p-5">
                <p className="text-card-FOREGROUND0">Knowledge Base</p>

                <h3 className="text-primary text-3xl font-bold">Active</h3>
              </div>

              <div className="bg-success-BG rounded-2xl p-5">
                <p className="text-card-FOREGROUND0">AI Assistant</p>

                <h3 className="text-status-PUBLISHED text-3xl font-bold">Online</h3>
              </div>

              <div className="rounded-2xl bg-purple-50 p-5">
                <p className="text-card-FOREGROUND0">HMIS</p>

                <h3 className="text-3xl font-bold text-purple-700">Connected</h3>
              </div>

              <div className="rounded-2xl bg-orange-50 p-5">
                <p className="text-card-FOREGROUND0">Security</p>

                <h3 className="text-3xl font-bold text-orange-700">Secure</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
