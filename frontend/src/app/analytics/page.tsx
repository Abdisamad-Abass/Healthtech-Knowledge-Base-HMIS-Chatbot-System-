'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Articles',
    value: 120,
  },

  {
    name: 'Users',
    value: 30,
  },

  {
    name: 'Chats',
    value: 450,
  },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <h1 className="text-4xl font-bold text-gray-800">Admin Analytics</h1>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-xl">
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
