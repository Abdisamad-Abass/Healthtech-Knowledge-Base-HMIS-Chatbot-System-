'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="bg-primary-soft min-h-screen p-10">
      <h1 className="text-4xl font-bold">Users Management</h1>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {users.map((u) => (
          <div key={u.id} className="bg-card rounded-xl p-6 shadow">
            <h2 className="font-bold">{u.name}</h2>

            <p>{u.email}</p>

            <span>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
