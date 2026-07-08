'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between bg-blue-700 p-4 text-white">
      <h1 className="text-xl font-bold">HealthTech KB</h1>

      <div className="space-x-5">
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/search">Search</Link>

        <Link href="/hmis">HMIS</Link>
      </div>
    </nav>
  );
}
