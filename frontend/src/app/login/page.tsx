'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { assets } from '@/assets/assets';

import { Eye, EyeOff, CheckCircle2, CircleAlert, Info, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type MessageType = 'success' | 'error' | 'info';

interface SystemMessage {
  type: MessageType;
  title: string;
  message: string;
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);

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

    if (systemMessage) {
      setSystemMessage(null);
    }
  };

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setSystemMessage(null);
    setShowPassword(false);
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as any).response;

      return response?.data?.message || response?.data?.error || fallback;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return fallback;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSystemMessage(null);

    if (!form.email || !form.password) {
      setSystemMessage({
        type: 'error',
        title: 'Missing information',
        message: 'Please enter your email address and password to continue.',
      });

      return;
    }

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

      setSystemMessage({
        type: 'success',
        title: 'Login successful',
        message: `Welcome back, ${user.name}. Redirecting you to your dashboard...`,
      });

      setTimeout(() => {
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
      }, 700);
    } catch (err: unknown) {
      setSystemMessage({
        type: 'error',
        title: 'Unable to sign in',
        message: getErrorMessage(
          err,
          'We could not sign you in. Please check your credentials and try again.',
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSystemMessage(null);

    if (!form.name || !form.email || !form.password) {
      setSystemMessage({
        type: 'error',
        title: 'Missing information',
        message: 'Please complete all required fields before creating your account.',
      });

      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSystemMessage({
        type: 'success',
        title: 'Account created successfully',
        message:
          'Your account has been created. You can now sign in securely using your email and password.',
      });

      setIsLogin(true);

      setForm({
        name: '',
        email: '',
        password: '',
      });
    } catch (err: unknown) {
      setSystemMessage({
        type: 'error',
        title: 'Registration failed',
        message: getErrorMessage(err, 'We could not create your account. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMessageIcon = () => {
    if (!systemMessage) return null;

    if (systemMessage.type === 'success') {
      return <CheckCircle2 className="text-success h-5 w-5 shrink-0" strokeWidth={2.2} />;
    }

    if (systemMessage.type === 'error') {
      return <CircleAlert className="text-danger h-5 w-5 shrink-0" strokeWidth={2.2} />;
    }

    return <Info className="text-info h-5 w-5 shrink-0" strokeWidth={2.2} />;
  };

  const messageClass = () => {
    if (!systemMessage) return '';

    switch (systemMessage.type) {
      case 'success':
        return 'alert-success';

      case 'error':
        return 'alert-danger';

      case 'info':
        return 'alert-info';

      default:
        return '';
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-2 lg:gap-10">
        {/* LEFT SIDE */}
        <aside className="relative hidden min-h-[420px] lg:block">
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
          <div className="bg-primary/75 absolute inset-0">
            <div className="from-primary/90 via-primary to-primary-hover absolute inset-0 bg-gradient-to-br">
              <div className="relative flex h-full flex-col justify-center px-8 py-12 xl:px-14">
                <div className="text-primary-foreground bg-card/10 border-border/20 mb-8 inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm backdrop-blur">
                  Clinical AI Knowledge Platform
                </div>

                <h1 className="text-primary-foreground max-w-lg text-4xl leading-tight font-bold xl:text-5xl">
                  Intelligence in every interaction.
                </h1>

                <p className="text-primary-foreground/90 mt-5 max-w-md text-base xl:text-lg">
                  Secure access to your HealthTech knowledge base with AI-assisted search, verified
                  clinical content, and enterprise-grade protection.
                </p>

                <div className="mt-8 grid max-w-md grid-cols-2 gap-4 xl:mt-10 xl:gap-6">
                  <div className="bg-card/10 border-border/15 rounded-2xl border p-4 backdrop-blur xl:p-5">
                    <p className="text-primary-foreground text-2xl font-bold xl:text-3xl">99.9%</p>

                    <p className="text-primary-foreground/80 mt-1 text-xs xl:text-sm">
                      Knowledge accuracy
                    </p>
                  </div>

                  <div className="bg-card/10 border-border/15 rounded-2xl border p-4 backdrop-blur xl:p-5">
                    <p className="text-primary-foreground text-2xl font-bold xl:text-3xl">
                      256-bit
                    </p>

                    <p className="text-primary-foreground/80 mt-1 text-xs xl:text-sm">
                      End-to-end encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <article className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 md:px-10 lg:min-h-screen lg:px-8 xl:px-10">
          <div className="w-full max-w-md">
            {/* Header */}
            <header>
              <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h1>

              <p className="text-muted-foreground mt-2 text-sm leading-6 transition-all duration-300">
                {isLogin
                  ? 'Sign in securely to access your HealthTech knowledge base dashboard and AI-powered clinical resources.'
                  : 'Create a secure account to access the knowledge base, collaborate with editors, and manage healthcare content.'}
              </p>
            </header>

            {/* SYSTEM MESSAGE */}
            {systemMessage && (
              <div
                role={systemMessage.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`animate-scale-in mt-5 flex w-full items-start gap-3 rounded-xl border p-3.5 shadow-sm sm:p-4 ${messageClass()}`}
              >
                {/* Icon */}
                <div className="mt-0.5">{renderMessageIcon()}</div>

                {/* Message */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words">{systemMessage.title}</p>

                  <p className="mt-1 text-sm leading-5 break-words opacity-90">
                    {systemMessage.message}
                  </p>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setSystemMessage(null)}
                  className="shrink-0 rounded-md p-1 opacity-60 transition hover:bg-current/10 hover:opacity-100"
                  aria-label="Dismiss message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="mt-4 space-y-5 sm:mt-5"
            >
              {/* Tabs */}
              <div className="border-border bg-muted grid grid-cols-2 gap-1 rounded-xl border p-1">
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isLogin
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    !isLogin
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Name */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-card-foreground">
                    Full Name <span className="text-danger">*</span>
                  </Label>

                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="w-full"
                  />
                </div>
              )}

              {/* Email */}
              <div className="mt-2 space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email Address <span className="text-danger">*</span>
                </Label>

                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your Email"
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password <span className="text-danger">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pr-12"
                    placeholder="Enter Password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary-hover h-12 w-full rounded-xl transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </span>
                ) : isLogin ? (
                  'Sign in to dashboard'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            {/* Security footer */}
            <div className="border-border text-muted-foreground mt-6 flex items-start justify-center gap-2 border-t pt-5 text-center text-xs sm:items-center">
              <div className="bg-success mt-1 h-1.5 w-1.5 shrink-0 rounded-full sm:mt-0" />

              <span>Secure connection • Your information is protected</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
