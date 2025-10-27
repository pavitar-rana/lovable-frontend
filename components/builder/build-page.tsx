import { useState } from "react";
import axios from "axios";
import type { ModelMessage } from "ai";
import { CodePreviewTabs } from "./code-preview-tabs";
import { ChatComponent } from "./chat-comp";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";

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

  const handleChat = async () => {
    if (!userPrompt.trim()) return alert("Prompt needed");

    setLoading(true);

    const newMessage: ModelMessage[] = [
      ...messages,
      {
        role: "user",
        content: userPrompt,
      },
    ];

    setMessages(newMessage);

    console.log("information : ", {
      sandBoxId,
      userPrompt,
      messages,
    });

    const res = await axios.post("http://localhost:3000/chat", {
      prompt: userPrompt,
      sandboxId: sandBoxId,
      messages: newMessage,
    });

    console.log("output : ", res.data);

    if (res.data.url) {
      setTimeout(() => {
        setProjectUrl(res.data.url);
        setSandBoxId(res.data.sandboxId);
        setMessages(res.data.messages);
        setLoading(false);
      }, 2000);
    }
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
