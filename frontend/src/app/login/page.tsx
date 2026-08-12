'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { assets } from '@/assets/assets';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);

      localStorage.setItem('user', JSON.stringify(user));

      localStorage.setItem('tokenExpiry', (Date.now() + 8 * 60 * 60 * 1000).toString());

      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;

        case 'EDITOR':
          router.push('/editor/dashboard');
          break;

        case 'VIEWER':
          router.push('/viewer');
          break;

        default:
          router.push('/login');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data?.message
          : null;

      alert(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert('Account created successfully.');

      setIsLogin(true);

      setForm({
        name: '',
        email: '',
        password: '',
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data?.message
          : null;

      alert(message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="grid min-h-screen grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <aside className="relative">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={assets.login}
              alt="Login background"
              fill
              priority
              className="object-cover"
              sizes="50vw"
            />
          </div>

          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-[#0e59c190]">
            {/*content */}
            <div className="relative flex h-full flex-col justify-center px-14">
              <h1 className="text-5xl font-bold text-white">Intelligence in Every Interaction.</h1>
              <p className="mt-2 font-medium text-gray-100">
                Access the next generation of HealthTech Knowledge Base Systems. Secure, fast, and
                engineered for clinical accuracy.
              </p>
              <div className="mt-3 flex items-center gap-5">
                <p className="flex flex-col font-bold text-white">
                  99.9%
                  <span className="text-sm font-light text-white">Accuracy</span>
                </p>
                <p className="flex flex-col text-white">
                  256-bit
                  <span>Encryption</span>
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side */}
        <article className="flex items-center justify-center px-10">
          <div className="w-full max-w-md">
            {/* Header */}
            <header>
              <h1 className="text-2xl font-bold">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h1>
              <p className="text-gray-600">
                {isLogin
                  ? 'Enter your credentials to access the administrative dashboard.'
                  : 'Create your secure account to start contributing to the knowledge base'}
              </p>
            </header>

            {/* Form */}
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-3 space-y-5">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`w-1/2 pb-3 text-sm font-semibold transition ${
                    isLogin ? 'border-b-2 border-[#003C90] text-[#003C90]' : 'text-gray-500'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`w-1/2 pb-3 text-sm font-semibold transition ${
                    !isLogin ? 'border-b-2 border-[#003C90] text-[#003C90]' : 'text-gray-500'
                  }`}
                >
                  Register
                </button>
              </div>
              {/* Name (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-500">
                    Full Name <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className=""
                  />
                </div>
              )}
              {/* Email*/}
              <div className="mt-2 space-y-2">
                <Label htmlFor="email" className="text-gray-500">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  className=""
                  placeholder="Enter your Email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-500">
                  Password <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    className="pr-12"
                    placeholder="Enter Password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition hover:text-[#003C90]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full text-white">
                {loading
                  ? 'Please Wait...'
                  : isLogin
                    ? 'Sign in to Dashboard'
                    : 'Create professional account'}
              </Button>
            </form>
          </div>
        </article>
      </section>
    </main>
  );
}
