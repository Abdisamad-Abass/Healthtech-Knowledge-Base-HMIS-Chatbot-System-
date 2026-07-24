'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ListFilter, Download, Edit, Trash2, X, Loader2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  department: string | null;
  isActive: boolean;

  _count: {
    articles: number;
    feedbacks: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'VIEWER',
    department: '',
    password: '',
    isActive: true,
  });

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    editorUsers: 0,
    viewerUsers: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);

  /* fetch get users */
  const fetchUsers = async (page = pagination.page) => {
    try {
      setLoading(true);

      const res = await api.get('/users', {
        params: {
          page,
          limit: pagination.limit,

          search: search || undefined,
          role: selectedRole || undefined,
          department: selectedDepartment || undefined,
          status: selectedStatus || undefined,
        },
      });

      setUsers(res.data.users);
      setPagination(res.data.pagination);
      setStatistics(res.data.statistics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (id: string) => {
    try {
      const res = await api.get(`/users/${id}`);

      const user = res.data;

      setEditForm({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role,
        department: user.department || '',
        password: '',
        isActive: user.isActive,
      });

      setOpenEdit(true);
    } catch (err) {
      console.log(err);
      alert('Failed to load user.');
    }
  };

  const updateUser = async () => {
    try {
      setSaving(true);

      await api.put(`/users/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        department: editForm.department,
        isActive: editForm.isActive,
        password: editForm.password.length > 0 ? editForm.password : undefined,
      });

      setOpenEdit(false);

      fetchUsers(pagination.page);

      alert('User updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const fetchDepartments = async () => {
    const res = await api.get('/users/departments');

    setDepartments(res.data);
  };
  useEffect(() => {
    fetchDepartments();
  }, []);
  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, selectedRole, selectedDepartment, selectedStatus]);

  /* page handlers */
  const nextPage = () => {
    if (pagination.hasNext) {
      fetchUsers(pagination.page + 1);
    }
  };

  const previousPage = () => {
    if (pagination.hasPrevious) {
      fetchUsers(pagination.page - 1);
    }
  };

  const cards = [
    {
      title: 'Total Users',
      total: statistics.totalUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      total: statistics.activeUsers,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive Users',
      total: statistics.inactiveUsers,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Administrators',
      total: statistics.adminUsers,
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      title: 'Editors',
      total: statistics.editorUsers,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Viewers',
      total: statistics.viewerUsers,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
  ];
  const roles = ['ADMIN', 'EDITOR', 'VIEWER'];
  const departments1 = ['Finance', 'HR', 'Compliance', 'Engineering'];
  const users1 = [
    {
      name: 'Jane Doe',
      email: 'j.doe@healthtech.com',
      role: 'Admin',
      department: 'Clinical',
      status: 'Inactive',
    },
    {
      name: 'Jane Doe',
      email: 'joe@healthtech.com',
      role: 'Editor',
      department: 'Clinical',
      status: 'Active',
    },
    {
      name: 'Jane Doe',
      email: 'doe@healthtech.com',
      role: 'Admin',
      department: 'Clinical',
      status: 'Active',
    },
    {
      name: 'Jane Doe',
      email: 'jdoe@healthtech.com',
      role: 'Viewer',
      department: 'Clinical',
      status: 'Active',
    },
    {
      name: 'Jane Doe',
      email: 'j@healthtech.com',
      role: 'Admin',
      department: 'Clinical',
      status: 'Active',
    },
  ];
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="">Oversee system access and permissions for all HealthTech KB personnel.</p>
        </div>
        <Link href="/admin/users/create">
          <button className="rounded-2xl bg-blue-500 px-5 py-2">Create User</button>
        </Link>
      </header>
      {/* cards */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-gray-200 ${card.bg} p-4 text-center shadow-sm`}
          >
            <p className="text-sm text-gray-500">{card.title}</p>

            <h2 className={`mt-2 text-3xl font-bold ${card.color}`}>{card.total}</h2>
          </div>
        ))}
      </div>
      {/* Search Section */}
      <section className="mt-3 rounded-2xl border border-gray-300 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-72 rounded-lg border px-4"
            />
            {/* roles */}
            <div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11 w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* departments */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-11 w-40">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>

              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-11 w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="">All Status</SelectItem>

                <SelectItem value="active">Active</SelectItem>

                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearch('');
                setSelectedRole('');
                setSelectedDepartment('');
                setSelectedStatus('');
              }}
              className="rounded-lg border px-4 py-2"
            >
              Clear Filters
            </button>
            {/*<ListFilter size={18} />*/}
            <Download size={18} />
          </div>
        </div>
      </section>

      {/* table section */}
      <section className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div>
          <table className="w-full table-fixed">
            <thead className="bg-gray-200">
              <tr>
                <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  USER
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  ROLE
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  DEPARTMENT
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  STATUS
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u, index) => (
                  <tr key={index} className="border-b border-gray-200 transition hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`flex h-10 w-10 items-center justify-center rounded-full p-2 font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-gradient-to-br from-red-500 to-red-700'
                              : u.role === 'EDITOR'
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                          }`}
                        >
                          {u.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </p>
                        <div className="flex flex-col">
                          <p className="">{u.name}</p>
                          <span className="text-gray-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded-xl px-3 py-1 ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'EDITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-slate-700">{u.department || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`relative h-5 w-9 rounded-full transition ${u.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                          <div
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${u.isActive ? 'right-0.5' : 'left-0.5'}`}
                          />
                        </div>

                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(u.id)}
                          className="rounded-lg p-2 transition hover:bg-blue-100"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>

                        <button>
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* pagination */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> -
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> users
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={previousPage}
                disabled={!pagination.hasPrevious}
                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span className="rounded-lg border px-4 py-2">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={!pagination.hasNext}
                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {openEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              {/* Header */}

              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-2xl font-bold">Edit User</h2>

                  <p className="text-sm text-gray-500">Update user information</p>
                </div>

                <button onClick={() => setOpenEdit(false)}>
                  <X />
                </button>
              </div>

              {/* Body */}

              <div className="grid grid-cols-2 gap-5 p-6">
                {/* Name */}

                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>

                  <input
                    className="w-full rounded-lg border p-3"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email */}

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>

                  <input
                    className="w-full rounded-lg border p-3"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Role */}

                <div>
                  <label className="mb-2 block text-sm font-medium">Role</label>

                  <select
                    className="w-full rounded-lg border p-3"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as any,
                      })
                    }
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                {/* Department */}

                <div>
                  <label className="mb-2 block text-sm font-medium">Department</label>

                  <input
                    className="w-full rounded-lg border p-3"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        department: e.target.value,
                      })
                    }
                  />
                </div>
                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Status</label>

                  <select
                    className="w-full rounded-lg border p-3"
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        isActive: e.target.value === 'active',
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {/* Password */}

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">New Password (Optional)</label>

                  <input
                    type="password"
                    className="w-full rounded-lg border p-3"
                    placeholder="Leave blank to keep current password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Footer */}

              <div className="flex justify-end gap-3 border-t p-6">
                <button onClick={() => setOpenEdit(false)} className="rounded-lg border px-6 py-3">
                  Cancel
                </button>

                <button
                  disabled={saving}
                  onClick={updateUser}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
