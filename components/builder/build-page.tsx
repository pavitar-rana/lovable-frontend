import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { ModelMessage } from "ai";
import { CodePreviewTabs } from "./code-preview-tabs";
import { ChatComponent } from "./chat-comp";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  setMessages,
  messages,
  query,
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
  messages: ModelMessage[];
  setMessages: any;
  query: string | null;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<{ name: string; content: string }[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    // Sandbox setup
    socket.on("sandbox:connected", ({ sandboxId, url }) => {
      console.log("Sandbox connected:", sandboxId);
      setSandBoxId(sandboxId);
      setProjectUrl(url);
      setLogs((p) => [
        ...p,
        {
          name: "Sandbox Connected",
          content: sandboxId,
        },
      ]);
    });

    // update file
    socket.on("tool:updateFile", (d) => {
      setLogs((p) => [
        ...p,
        {
          name: "Updating",
          content: d.location.startsWith("/home/user") ? d.location.split("/home/user/")[1] : d.location,
        },
      ]);
    });
    socket.on("tool:runCommand", (d) => {
      setLogs((p) => [
        ...p,
        {
          name: "Running",
          content: d.command,
        },
      ]);
    });

    // AI updates
    socket.on("ai:done", (d) => {
      console.log("AI done:", d);
      setTimeout(() => {
        setProjectUrl(d.url);
        setSandBoxId(d.sandboxId);
        setMessages(d.messages);
        setLoading(false);
        // router.replace(`/builder/${d.projectId}`);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", `/builder/${d.projectId}`);
        }
      }, 1000);
      // setLogs((p) => [...p, `URL: ${d.url}`]);
    });

    socket.on("error", (err) => console.error("Socket error:", err));

    // Clean up once
    return () => {
      socket.disconnect();
    };
  }, [setSandBoxId, setProjectUrl, router, setMessages]);

  useEffect(() => {
    if (query && messages.length === 0) {
      const newMessage: ModelMessage[] = [...messages, { role: "user", content: query || "" }];
      setMessages(newMessage);

      const socket = socketRef.current;
      if (!socket) {
        console.error("Socket not connected");
        return;
      }

      if (session?.user?.id) {
        console.log("starting chat for query projectId: ", projectId);
        console.log("starting chat for query  : ", query);
        toast.info("Starting Chat");
        socket.emit("startChat", {
          prompt: query,
          messages: newMessage,
          sandboxId: sandBoxId,
          userId: session.user.id,
          projectId,
        });
      }
    }
  }, [query, messages, session, projectId, sandBoxId, setMessages]);

  const handleChat = async () => {
    if (!userPrompt.trim()) return toast.warning("Prompt needed");
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
    if (session?.user?.id) {
      console.log("starting chat for : ", projectId);
      toast.info("Starting Chat");
      socket.emit("startChat", {
        prompt: userPrompt,
        messages: newMessage,
        sandboxId: sandBoxId,
        userId: session.user.id,
        projectId,
      });
    }
  };

  return (
    <div className="flex h-full w-full bg-background text-foreground ">
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
