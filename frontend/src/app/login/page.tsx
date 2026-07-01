"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: any) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // verify selected role matches backend role

      if (user.role !== role) {
        setError(`This account is registered as ${user.role}, not ${role}`);

        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(user));

      const expiry = Date.now() + 8 * 60 * 60 * 1000;

      localStorage.setItem("tokenExpiry", expiry.toString());

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  }

  const roles = [
    {
      name: "ADMIN",
      icon: "👑",
      color: "from-red-500 to-orange-500",
      text: "System Control",
    },

    {
      name: "EDITOR",
      icon: "✍️",
      color: "from-green-500 to-emerald-500",
      text: "Manage Articles",
    },

    {
      name: "VIEWER",
      icon: "👤",
      color: "from-blue-500 to-indigo-500",
      text: "Read Knowledge",
    },
  ];

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-blue-100
      via-white
      to-indigo-200
      px-5
      "
    >
      <div
        className="
        absolute
        top-10
        text-center
        "
      >
        <h1
          className="
          text-5xl
          font-extrabold
          text-blue-700
          "
        >
          HealthTech
          <span className="text-gray-800"> KBS</span>
        </h1>

        <p className="text-gray-500 mt-3">
          Knowledge Base & AI Assistant System
        </p>
      </div>

      <form
        onSubmit={submit}
        className="
        mt-20
        bg-white/90
        backdrop-blur
        rounded-3xl
        shadow-2xl
        p-10
        w-full
        max-w-md
        border
        border-gray-100
        "
      >
        <div className="text-center mb-8">
          <div
            className="
            mx-auto
            w-20
            h-20
            rounded-full
            bg-blue-100
            flex
            items-center
            justify-center
            text-4xl
            "
          >
            🔐
          </div>

          <h2
            className="
            text-3xl
            font-bold
            text-gray-800
            mt-4
            "
          >
            Welcome Back
          </h2>

          <p className="text-gray-500">Login to your workspace</p>
        </div>

        {error && (
          <div
            className="
            bg-red-100
            text-red-600
            p-3
            rounded-xl
            mb-5
            text-center
            "
          >
            {error}
          </div>
        )}

        <label className="text-sm font-semibold text-gray-700">Email</label>

        <input
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          className="
          mt-2
          mb-5
          w-full
          border
          p-4
          rounded-xl
          text-gray-700
          focus:ring-2
          focus:ring-blue-500
          outline-none
          "
        />

        <label className="text-sm font-semibold text-gray-700">Password</label>

        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          className="
          mt-2
          mb-6
          w-full
          border
          p-4
          rounded-xl
          text-gray-700
          focus:ring-2
          focus:ring-blue-500
          outline-none
          "
        />

        <p
          className="
          font-semibold
          text-gray-700
          mb-3
          "
        >
          Select Role
        </p>

        <div
          className="
          grid
          grid-cols-3
          gap-3
          mb-7
          "
        >
          {roles.map((r) => (
            <button
              type="button"
              key={r.name}
              onClick={() => setRole(r.name)}
              className={`
              
              rounded-2xl
              p-3
              text-white
              shadow-lg
              transition
              ${
                role === r.name
                  ? `bg-gradient-to-br ${r.color} scale-105`
                  : "bg-gray-300"
              }

              `}
            >
              <div className="text-2xl">{r.icon}</div>

              <div className="text-xs font-bold">{r.name}</div>
            </button>
          ))}
        </div>

        <button
          disabled={loading}
          className="
          w-full
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          hover:from-blue-700
          hover:to-indigo-700
          text-white
          p-4
          rounded-xl
          font-bold
          shadow-lg
          transition
          active:scale-95
          "
        >
          {loading ? "Logging in..." : "Login to Dashboard 🚀"}
        </button>

        <p
          className="
          text-center
          text-sm
          text-gray-500
          mt-6
          "
        >
          Secure Healthcare Knowledge System
        </p>
      </form>
    </div>
  );
}
