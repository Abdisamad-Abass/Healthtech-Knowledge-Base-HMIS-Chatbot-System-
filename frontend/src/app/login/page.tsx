'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: any) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
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

      localStorage.setItem('token', token);

      localStorage.setItem('user', JSON.stringify(user));

      const expiry = Date.now() + 8 * 60 * 60 * 1000;

      localStorage.setItem('tokenExpiry', expiry.toString());

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }

    setLoading(false);
  }

  const roles = [
    {
      name: 'ADMIN',
      icon: '👑',
      color: 'from-red-500 to-orange-500',
      text: 'System Control',
    },

    {
      name: 'EDITOR',
      icon: '✍️',
      color: 'from-green-500 to-emerald-500',
      text: 'Manage Articles',
    },

    {
      name: 'VIEWER',
      icon: '👤',
      color: 'from-blue-500 to-indigo-500',
      text: 'Read Knowledge',
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-5">
      <div className="absolute top-10 text-center">
        <h1 className="text-5xl font-extrabold text-blue-700">
          HealthTech
          <span className="text-gray-800"> KBS</span>
        </h1>

        <p className="mt-3 text-gray-500">Knowledge Base & AI Assistant System</p>
      </div>

      <form
        onSubmit={submit}
        className="mt-20 w-full max-w-md rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-2xl backdrop-blur"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            🔐
          </div>

          <h2 className="mt-4 text-3xl font-bold text-gray-800">Welcome Back</h2>

          <p className="text-gray-500">Login to your workspace</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-3 text-center text-red-600">{error}</div>
        )}

        <label className="text-sm font-semibold text-gray-700">Email</label>

        <input
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 mb-5 w-full rounded-xl border p-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-sm font-semibold text-gray-700">Password</label>

        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 mb-6 w-full rounded-xl border p-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="mb-3 font-semibold text-gray-700">Select Role</p>

        <div className="mb-7 grid grid-cols-3 gap-3">
          {roles.map((r) => (
            <button
              type="button"
              key={r.name}
              onClick={() => setRole(r.name)}
              className={`rounded-2xl p-3 text-white shadow-lg transition ${
                role === r.name ? `bg-gradient-to-br ${r.color} scale-105` : 'bg-gray-300'
              } `}
            >
              <div className="text-2xl">{r.icon}</div>

              <div className="text-xs font-bold">{r.name}</div>
            </button>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-95"
        >
          {loading ? 'Logging in...' : 'Login to Dashboard 🚀'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">Secure Healthcare Knowledge System</p>
      </form>
    </div>
  );
}
