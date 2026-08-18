'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Search,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Users,
  Shield,
  UserCheck,
  UserX,
  X,
  Loader2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

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
export default function UsersPage() {
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
      title: 'Total users',
      total: statistics.totalUsers,
      icon: <Users className="h-5 w-5" />,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      title: 'Active users',
      total: statistics.activeUsers,
      icon: <UserCheck className="h-5 w-5" />,
      iconClass: 'bg-success-BG text-status-PUBLISHED dark:bg-green-900/30 dark:text-vital',
    },
    {
      title: 'Inactive users',
      total: statistics.inactiveUsers,
      icon: <UserX className="h-5 w-5" />,
      iconClass:
        'bg-danger-BG text-status-REJECTED dark:bg-status-DELETED/30 dark:text-status-REJECTED',
    },
    {
      title: 'Administrators',
      total: statistics.adminUsers,
      icon: <Shield className="h-5 w-5" />,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      title: 'Editors',
      total: statistics.editorUsers,
      icon: <Edit className="h-5 w-5" />,
      iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      title: 'Viewers',
      total: statistics.viewerUsers,
      icon: <Users className="h-5 w-5" />,
      iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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
      {/* header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl">
            <Users className="text-primary h-5 w-5" />
          </div>

          <div>
            <h1 className="text-foreground text-xl font-bold">User management</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Oversee system access, permissions, and user accounts across the knowledge base
              platform.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchUsers(pagination.page)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Link href="/admin/users/new">
            <Button>Create user</Button>
          </Link>
        </div>
      </div>
      {/* cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  {card.icon}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">{card.title}</p>
                <p className="text-foreground text-2xl font-bold tracking-tight">{card.total}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Section */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {/* Search */}
            <div className="relative min-w-[280px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Role */}
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value ?? '')}>
              <SelectTrigger className="w-full xl:w-[100px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="__all_roles" disabled>
                  All roles
                </SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value ?? '')}
            >
              <SelectTrigger className="w-full xl:w-[190px]">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="__all_departments" disabled>
                  All departments
                </SelectItem>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value ?? '')}
            >
              <SelectTrigger className="w-full xl:w-[115px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="__all_status" disabled>
                  All status
                </SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear filters */}
            <Button
              variant="outline"
              className="w-full shrink-0 xl:w-[120px]"
              onClick={() => {
                setSearch('');
                setSelectedRole('');
                setSelectedDepartment('');
                setSelectedStatus('');
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* table section */}
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                        {u.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-muted-foreground text-sm">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={
                        u.role === 'ADMIN'
                          ? 'badge badge-role-admin'
                          : u.role === 'EDITOR'
                            ? 'badge badge-role-editor'
                            : 'badge badge-role-viewer'
                      }
                    >
                      {u.role}
                    </span>
                  </TableCell>

                  <TableCell>{u.department || '-'}</TableCell>

                  <TableCell>
                    <span className={u.isActive ? 'badge badge-published' : 'badge badge-rejected'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-primary/10 hover:text-primary cursor-pointer"
                        onClick={() => openEditModal(u.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-danger-BG hover:text-status-REJECTED cursor-pointer"
                      >
                        <Trash2 className="text-danger0 h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-border flex items-center justify-between border-t px-6 py-4">
          <p className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            users
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!pagination.hasPrevious}
            >
              Previous
            </Button>

            <div className="text-muted-foreground px-3 text-sm">
              {pagination.page} / {pagination.totalPages}
            </div>

            <Button variant="outline" size="sm" onClick={nextPage} disabled={!pagination.hasNext}>
              Next
            </Button>
          </div>
        </div>

        {openEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-[760px] max-w-[95vw] rounded-2xl shadow-2xl">
              {/* Header */}

              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-xl font-semibold">Edit user</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Update the user's account information and permissions.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-danger-BG hover:text-status-REJECTED cursor-pointer"
                  onClick={() => setOpenEdit(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Body */}

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full name</Label>
                  <Input
                    id="edit-name"
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

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email address</Label>
                  <Input
                    id="edit-email"
                    type="email"
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
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        role: (value ?? 'VIEWER') as 'ADMIN' | 'EDITOR' | 'VIEWER',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
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
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        isActive: (value ?? 'inactive') === 'active',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-password">New password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Leave blank to keep the current password"
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
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setOpenEdit(false)}
                >
                  Cancel
                </Button>

                <Button className="cursor-pointer" disabled={saving} onClick={updateUser}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
