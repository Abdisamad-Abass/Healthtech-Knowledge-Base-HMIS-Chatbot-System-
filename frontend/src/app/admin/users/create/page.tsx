'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function CreateUser() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    role: 'VIEWER',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRole = (value: string) => {
    setForm({
      ...form,
      role: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return alert('Please fill all required fields.');
    }

    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match.');
    }

    try {
      setLoading(true);

      await api.post('/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
      });

      alert('User created successfully.');

      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to Users
      </button>

      <p className="text-gray-500">Add a new user to the HealthTech KB.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}

        <div>
          <label className="mb-2 block text-sm font-medium">Full Name *</label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input w-full"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm font-medium">Email Address *</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input w-full"
            placeholder="john@example.com"
          />
        </div>

        {/* Department */}

        <div>
          <label className="mb-2 block text-sm font-medium">Department</label>

          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="input w-full"
            placeholder="IT Department"
          />
        </div>

        {/* Role */}

        <div>
          <label className="mb-2 block text-sm font-medium">Role *</label>

          <Select value={form.role} onValueChange={handleRole}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>

              <SelectItem value="EDITOR">Editor</SelectItem>

              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password */}

        <div>
          <label className="mb-2 block text-sm font-medium">Password *</label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input w-full pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}

        <div>
          <label className="mb-2 block text-sm font-medium">Confirm Password *</label>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input w-full pr-12"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-3 right-3"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border px-6 py-3"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}

            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
