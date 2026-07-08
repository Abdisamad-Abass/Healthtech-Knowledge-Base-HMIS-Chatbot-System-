'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      router.push('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-10">Checking access...</div>;
  }

  return children;
}
