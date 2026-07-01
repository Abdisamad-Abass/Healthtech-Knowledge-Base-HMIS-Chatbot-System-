import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  return (
    <main
      className="
      min-h-screen
      bg-gradient-to-br
      from-blue-100
      via-white
      to-blue-50
    "
    >
      <section
        className="
        container
        mx-auto
        px-6
        py-20
      "
      >
        <div
          className="
          grid
          md:grid-cols-2
          gap-12
          items-center
        "
        >
          <div>
            <div
              className="
              inline-flex
              items-center
              bg-blue-100
              text-blue-700
              px-5
              py-2
              rounded-full
              font-medium
              mb-6
              "
            >
              🚀 HealthTech AI Platform
            </div>

            <h1
              className="
              text-5xl
              md:text-6xl
              font-extrabold
              text-gray-900
              leading-tight
              "
            >
              HealthTech Knowledge Base
              <span
                className="
                text-blue-600
              "
              >
                {" "}
                Assistant
              </span>
            </h1>

            <p
              className="
              mt-6
              text-lg
              text-gray-600
              leading-relaxed
              max-w-xl
              "
            >
              Centralized healthcare documentation platform with AI powered HMIS
              chatbot support.
            </p>

            <div
              className="
              mt-10
              flex
              flex-wrap
              gap-4
            "
            >
              <Link
                href="/login"
                className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-8
                py-4
                rounded-2xl
                shadow-lg
                transition
                font-semibold
                "
              >
                Login
              </Link>

              <Link
                href="/search"
                className="
                bg-white
                border-2
                border-blue-600
                text-blue-600
                px-8
                py-4
                rounded-2xl
                hover:bg-blue-50
                transition
                font-semibold
                "
              >
                Search Knowledge Base
              </Link>
            </div>

            <div
              className="
              mt-12
              grid
              grid-cols-3
              gap-4
            "
            >
              <div
                className="
                bg-white
                p-4
                rounded-2xl
                shadow
              "
              >
                <h3
                  className="
                  text-xl
                  font-bold
                  text-blue-600
                "
                >
                  AI
                </h3>

                <p className="text-gray-500 text-sm">Assistant</p>
              </div>

              <div
                className="
                bg-white
                p-4
                rounded-2xl
                shadow
              "
              >
                <h3
                  className="
                  text-xl
                  font-bold
                  text-green-600
                "
                >
                  HMIS
                </h3>

                <p className="text-gray-500 text-sm">Support</p>
              </div>

              <div
                className="
                bg-white
                p-4
                rounded-2xl
                shadow
              "
              >
                <h3
                  className="
                  text-xl
                  font-bold
                  text-purple-600
                "
                >
                  KB
                </h3>

                <p className="text-gray-500 text-sm">Search</p>
              </div>
            </div>
          </div>

          <div
            className="
            bg-white/90
            backdrop-blur
            shadow-2xl
            rounded-3xl
            p-10
            border
            border-gray-100
            "
          >
            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-blue-100
              flex
              items-center
              justify-center
              text-3xl
              mb-6
              "
            >
              🏥
            </div>

            <h2
              className="
              text-3xl
              font-bold
              text-gray-800
              "
            >
              System Features
            </h2>

            <ul
              className="
              mt-8
              space-y-5
              text-gray-700
            "
            >
              <li
                className="
                bg-blue-50
                p-4
                rounded-xl
              "
              >
                ✅ Role Based Access Control
              </li>

              <li
                className="
                bg-blue-50
                p-4
                rounded-xl
              "
              >
                ✅ Article Management
              </li>

              <li
                className="
                bg-blue-50
                p-4
                rounded-xl
              "
              >
                ✅ Full Text Search
              </li>

              <li
                className="
                bg-blue-50
                p-4
                rounded-xl
              "
              >
                ✅ AI Knowledge Assistant
              </li>

              <li
                className="
                bg-blue-50
                p-4
                rounded-xl
              "
              >
                ✅ HMIS Embedded Widget
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}
