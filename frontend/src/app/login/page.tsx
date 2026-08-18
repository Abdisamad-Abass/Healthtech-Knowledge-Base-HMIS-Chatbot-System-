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
    <main className="bg-background min-h-screen">
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
            <div className="from-primary/90 via-primary absolute inset-0 bg-gradient-to-br to-[#0b3fd6]">
              <div className="relative flex h-full flex-col justify-center px-14">
                <div className="text-primary-foreground bg-card/10 border-border/20 mb-8 inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm backdrop-blur">
                  Clinical AI Knowledge Platform
                </div>

                <h1 className="text-primary-foreground max-w-lg text-5xl leading-tight font-bold">
                  Intelligence in every interaction.
                </h1>

                <p className="text-primary-foreground/90 mt-5 max-w-md text-lg">
                  Secure access to your HealthTech knowledge base with AI-assisted search, verified
                  clinical content, and enterprise-grade protection.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="bg-card/10 border-border/15 rounded-2xl border p-5 backdrop-blur">
                    <p className="text-primary-foreground text-3xl font-bold">99.9%</p>
                    <p className="text-primary-foreground/80 mt-1 text-sm">Knowledge accuracy</p>
                  </div>

                  <div className="bg-card/10 border-border/15 rounded-2xl border p-5 backdrop-blur">
                    <p className="text-primary-foreground text-3xl font-bold">256-bit</p>
                    <p className="text-primary-foreground/80 mt-1 text-sm">End-to-end encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side */}
        <article className="flex items-center justify-center px-10">
          <div className="w-full max-w-md">
            {/* Header */}
            <header>
              <h1 className="text-foreground text-2xl font-bold">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-6 transition-all duration-300">
                {isLogin
                  ? 'Sign in securely to access your HealthTech knowledge base dashboard and AI-powered clinical resources.'
                  : 'Create a secure account to access the knowledge base, collaborate with editors, and manage healthcare content.'}
              </p>
            </header>

            {/* Form */}
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-3 space-y-5">
              {/* Tabs */}
              <div className="border-border bg-muted grid grid-cols-2 gap-1 rounded-xl border">
                {/* Login Tab */}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isLogin
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  }`}
                >
                  Login
                </button>

                {/* Register Tab */}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    !isLogin
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  }`}
                >
                  Register
                </button>
              </div>
              {/* Name (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-card-FOREGROUND0">
                    Full Name <span className="text-danger0">*</span>
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
                <Label htmlFor="email" className="text-card-FOREGROUND0">
                  Email Address <span className="text-danger0">*</span>
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
                <Label htmlFor="password" className="text-card-FOREGROUND0">
                  Password <span className="text-danger0">*</span>
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
                    className="text-card-FOREGROUND0 absolute top-1/2 right-3 -translate-y-1/2 transition hover:text-[#003C90]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary-hover h-12 w-full rounded-xl transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in to dashboard' : 'Create account'}
              </Button>
            </form>
          </div>
        </article>
      </section>
    </main>
  );
}
