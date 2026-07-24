'use client';

import Link from 'next/link';

export default function AdminNavbar() {
  return (
    <nav className="fixed top-0 right-0 left-64 z-50 flex justify-between border-b border-gray-300 bg-[#F7F5FC] p-4">
      <h1 className="text-xl font-bold">HealthTech KB</h1>

      <div className="space-x-5">
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/search">Search</Link>

        <Link href="/hmis">HMIS</Link>
      </div>
    </nav>
  );
}
