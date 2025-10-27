import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { ModelMessage } from "ai";
import { CodePreviewTabs } from "./code-preview-tabs";
import { ChatComponent } from "./chat-comp";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";
import { io, Socket } from "socket.io-client";

const BuilderPage = ({
  userPrompt,
  setUserPrompt,
  tree,
  files,
  selectedFile,
  setSelectedFile,
  projectId,
  setProjectId,
  setProjectUrl,
  projectUrl,
  sandBoxId,
  fetchFiles,
  setSandBoxId,
}: {
  userPrompt: string;
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<{ fileName: string; code: string } | null>>;
  setProjectUrl: React.Dispatch<React.SetStateAction<string>>;
  setProjectId: React.Dispatch<React.SetStateAction<string>>;
  sandBoxId: string;
  setSandBoxId: React.Dispatch<React.SetStateAction<string>>;
  tree: any;
  fetchFiles: any;
  projectId: string;
  projectUrl: string;
  files: { path: string; code: string }[];
  selectedFile: any;
}) => {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    // Sandbox setup
    socket.on("sandbox:connected", ({ sandboxId }) => {
      console.log("Sandbox connected:", sandboxId);
      setSandBoxId(sandboxId);
      setLogs((p) => [...p, `Sandbox ID: ${sandboxId}`]);
    });

    // 🛠️ Tool updates
    socket.on("tool:start", (d) => setLogs((p) => [...p, `Starting ${d.name}`]));
    socket.on("tool:end", (d) => setLogs((p) => [...p, `Finished ${d.name}`]));

    // AI updates
    socket.on("ai:done", (d) => {
      console.log("AI done:", d);
      setTimeout(() => {
        setProjectUrl(d.url);
        setSandBoxId(d.sandboxId);
        setMessages(d.messages);
        setLoading(false);
      }, 1000);
      setLogs((p) => [...p, `URL: ${d.url}`]);
    });

    socket.on("error", (err) => console.error("Socket error:", err));

    // Clean up once
    return () => {
      socket.disconnect();
    };
  }, [setSandBoxId, setProjectUrl]);

  const handleChat = async () => {
    if (!userPrompt.trim()) return alert("Prompt needed");
    setLoading(true);

    const newMessage: ModelMessage[] = [...messages, { role: "user", content: userPrompt }];
    setMessages(newMessage);

    const socket = socketRef.current;
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    console.log("Emitting startChat:", {
      sandBoxId,
      userPrompt,
      messages: newMessage,
      socketId: socket.id,
    });

    socket.emit("startChat", {
      prompt: userPrompt,
      messages: newMessage,
      sandboxId: sandBoxId,
      userId: socket.id, // Use socket.id
    });
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground ">
      <ResizablePanelGroup direction="horizontal" className="max-w-full rounded-lg border ">
        <ResizablePanel defaultSize={25} className="p-3">
          <ChatComponent
            {...{
              userPrompt,
              setUserPrompt,
              handleChat,
              messages,
              loading,
              logs,
            }}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <CodePreviewTabs
            {...{
              tree,
              selectedFile,
              setSelectedFile,
              files,
              projectUrl,
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default BuilderPage;
