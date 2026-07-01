"use client";

import { useState } from "react";
import api from "@/lib/api";

type Message = {
  role: string;
  text: string;
};

export default function ChatBox() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  async function send() {
    if (!input) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: input,
      },
    ]);

    const res = await api.post("/chat", {
      question: input,
    });

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: res.data.answer,
      },
    ]);

    setInput("");
  }

  return (
    <div
      className="
h-full
flex
flex-col
bg-white
rounded-3xl
shadow-xl
p-6
"
    >
      <h1
        className="
text-2xl
font-bold
text-gray-800
"
      >
        🤖 KB Assistant
      </h1>

      <div
        className="
flex-1
overflow-y-auto
space-y-3
mt-5
"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "bg-blue-600 text-white p-3 rounded-xl ml-auto max-w-xs"
                : "bg-gray-100 text-gray-800 p-3 rounded-xl max-w-xs"
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <input
        className="
border
p-3
rounded-xl
text-gray-700
"
        placeholder="Ask HMIS question"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={send}
        className="
mt-3
bg-blue-600
text-white
p-3
rounded-xl
"
      >
        Send
      </button>
    </div>
  );
}
