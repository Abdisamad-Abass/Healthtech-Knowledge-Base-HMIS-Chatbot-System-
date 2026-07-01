"use client";

import { useRouter } from "next/navigation";

export default function ChatWidget() {
  const router = useRouter();

  return (
    <div
      className="
fixed
bottom-6
right-6
z-50
"
    >
      <button
        onClick={() => router.push("/widget")}
        className="
w-16
h-16
bg-blue-600
hover:bg-blue-700
text-white
rounded-full
shadow-2xl
flex
items-center
justify-center
text-3xl
transition
hover:scale-110
"
      >
        💬
      </button>
    </div>
  );
}
