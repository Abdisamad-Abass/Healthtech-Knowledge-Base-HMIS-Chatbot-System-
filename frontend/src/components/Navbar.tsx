"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="
bg-blue-700
text-white
p-4
flex
justify-between
"
    >
      <h1 className="font-bold text-xl">HealthTech KB</h1>

      <div className="space-x-5">
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/search">Search</Link>

        <Link href="/hmis">HMIS</Link>
      </div>
    </nav>
  );
}
