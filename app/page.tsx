"use client";

import { BASE_PROMPT } from "@/lib/prompt";
import axios from "axios";

import { useState } from "react";

export default function Home() {
  const [userPrompt, setUserPrompt] = useState(" ");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "user", content: BASE_PROMPT },
  ]);
  const [projectUrl, setProjectUrl] = useState(" ");

  const handleChat = async () => {
    if (!userPrompt.trim()) {
      return alert("prompt needed");
    }

    const newMessage: { role: "user" | "assistant"; content: string } = { role: "user", content: userPrompt };
    const updatedMessages = [...messages, newMessage];

    console.log("user message : ", updatedMessages);

    setMessages(updatedMessages);

    const res = await axios.post("http://localhost:3002", {
      prompt: userPrompt,
      messages: updatedMessages,
    });

    console.log("responset : ", res.data);

    if (res.data.url) {
      setProjectUrl(res.data.url);
    }
    if (res.data.step) {
      setMessages((prev) => {
        const assistantUpdated: { role: "user" | "assistant"; content: string }[] = [
          ...prev,
          {
            role: "assistant",
            content: JSON.stringify(res.data.step),
          },
        ];

        console.log("assistantUpdated : ", assistantUpdated);
        return assistantUpdated;
      });
    }
  };
  return (
    <div>
      <input
        placeholder="prompt"
        onChange={(e) => {
          setUserPrompt(e.target.value);
        }}
      />

      <button
        onClick={() => {
          handleChat();
        }}
      >
        Submit
      </button>
      <iframe id="inlineFrameExample" title="Your project" className="w-screen h-screen" src={projectUrl}></iframe>
    </div>
  );
}
