import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Sidebar />

        <div className="flex-1 p-10">
          <div className="mb-10">
            <h1
              className="
              text-4xl
              font-bold
              text-gray-800
              "
            >
              Knowledge Base Dashboard
            </h1>

            <p
              className="
              mt-3
              text-gray-500
              "
            >
              Manage your healthcare knowledge system and AI assistant
            </p>
          </div>

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            "
          >
            <div
              className="
              bg-white
              rounded-3xl
              shadow-lg
              p-7
              border
              border-gray-100
              hover:shadow-xl
              transition
              "
            >
              <div
                className="
                w-14
                h-14
                rounded-2xl
                bg-blue-100
                flex
                items-center
                justify-center
                text-3xl
                "
              >
                📚
              </div>

              <Link
                href="/articles"
                className="
                text-xl
                font-bold
                mt-5
                text-gray-800
                "
              >
                Articles
              </Link>

              <p
                className="
                text-gray-500
                mt-2
                "
              >
                Manage healthcare documentation
              </p>
            </div>

            <div
              className="
              bg-white
              rounded-3xl
              shadow-lg
              p-7
              border
              border-gray-100
              hover:shadow-xl
              transition
              "
            >
              <div
                className="
                w-14
                h-14
                rounded-2xl
                bg-green-100
                flex
                items-center
                justify-center
                text-3xl
                "
              >
                👥
              </div>

              <Link
                href="/users"
                className="
                text-xl
                font-bold
                mt-5
                text-gray-800
                "
              >
                Users
              </Link>

              <p
                className="
                text-gray-500
                mt-2
                "
              >
                Manage system users and roles
              </p>
            </div>

            <div
              className="
              bg-white
              rounded-3xl
              shadow-lg
              p-7
              border
              border-gray-100
              hover:shadow-xl
              transition
              "
            >
              <div
                className="
                w-14
                h-14
                rounded-2xl
                bg-purple-100
                flex
                items-center
                justify-center
                text-3xl
                "
              >
                🤖
              </div>

              <Link
                href="/analytics"
                className="
                text-xl
                font-bold
                mt-5
                text-gray-800
                "
              >
                Analytics
              </Link>

              <p
                className="
                text-gray-500
                mt-2
                "
              >
                Monitor AI assistant conversations
              </p>
            </div>
          </div>

          <div
            className="
            mt-10
            bg-white
            rounded-3xl
            shadow-lg
            p-8
            "
          >
            <h2
              className="
              text-2xl
              font-bold
              text-gray-800
              "
            >
              System Overview
            </h2>

            <div
              className="
              grid
              md:grid-cols-4
              gap-5
              mt-6
              "
            >
              <div
                className="
                bg-blue-50
                rounded-2xl
                p-5
                "
              >
                <p className="text-gray-500">Knowledge Base</p>

                <h3 className="text-3xl font-bold text-blue-700">Active</h3>
              </div>

              <div
                className="
                bg-green-50
                rounded-2xl
                p-5
                "
              >
                <p className="text-gray-500">AI Assistant</p>

                <h3 className="text-3xl font-bold text-green-700">Online</h3>
              </div>

              <div
                className="
                bg-purple-50
                rounded-2xl
                p-5
                "
              >
                <p className="text-gray-500">HMIS</p>

                <h3 className="text-3xl font-bold text-purple-700">
                  Connected
                </h3>
              </div>

              <div
                className="
                bg-orange-50
                rounded-2xl
                p-5
                "
              >
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
