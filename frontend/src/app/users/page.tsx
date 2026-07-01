"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <div
      className="
p-10
bg-blue-50
min-h-screen
"
    >
      <h1
        className="
text-4xl
font-bold
"
      >
        Users Management
      </h1>

      <div
        className="
grid
md:grid-cols-3
gap-5
mt-10
"
      >
        {users.map((u) => (
          <div
            key={u.id}
            className="
bg-white
rounded-xl
shadow
p-6
"
          >
            <h2 className="font-bold">{u.name}</h2>

            <p>{u.email}</p>

            <span>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
