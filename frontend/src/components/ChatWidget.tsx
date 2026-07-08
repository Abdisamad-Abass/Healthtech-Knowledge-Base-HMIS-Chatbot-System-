'use client';

import { useRouter } from 'next/navigation';

export default function ChatWidget() {
  const router = useRouter();

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={() => router.push('/widget')}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-2xl transition hover:scale-110 hover:bg-blue-700"
      >
        💬
      </button>
    </div>
  );
}
