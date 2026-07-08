import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Sidebar />

        <div className="flex-1 p-10">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-800">Knowledge Base Dashboard</h1>

            <p className="mt-3 text-gray-500">
              Manage your healthcare knowledge system and AI assistant
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-lg transition hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                📚
              </div>

              <Link href="/articles" className="mt-5 text-xl font-bold text-gray-800">
                Articles
              </Link>

              <p className="mt-2 text-gray-500">Manage healthcare documentation</p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-lg transition hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                👥
              </div>

              <Link href="/users" className="mt-5 text-xl font-bold text-gray-800">
                Users
              </Link>

              <p className="mt-2 text-gray-500">Manage system users and roles</p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-lg transition hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                🤖
              </div>

              <Link href="/analytics" className="mt-5 text-xl font-bold text-gray-800">
                Analytics
              </Link>

              <p className="mt-2 text-gray-500">Monitor AI assistant conversations</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-4">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-gray-500">Knowledge Base</p>

                <h3 className="text-3xl font-bold text-blue-700">Active</h3>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-gray-500">AI Assistant</p>

                <h3 className="text-3xl font-bold text-green-700">Online</h3>
              </div>

              <div className="rounded-2xl bg-purple-50 p-5">
                <p className="text-gray-500">HMIS</p>

                <h3 className="text-3xl font-bold text-purple-700">Connected</h3>
              </div>

              <div className="rounded-2xl bg-orange-50 p-5">
                <p className="text-gray-500">Security</p>

                <h3 className="text-3xl font-bold text-orange-700">Secure</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
