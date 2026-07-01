"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Articles",
    value: 120,
  },

  {
    name: "Users",
    value: 30,
  },

  {
    name: "Chats",
    value: 450,
  },
];

export default function Analytics() {
  return (
    <div
      className="
p-10
bg-gradient-to-br
from-blue-50
to-white
min-h-screen
"
    >
      <h1
        className="
text-4xl
font-bold
text-gray-800
"
      >
        Admin Analytics
      </h1>

      <div className="bg-white rounded-3xl shadow-xl p-8 mt-10">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
