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

  const handleChat = async () => {
    if (!userPrompt.trim()) return alert("Prompt needed");

    console.log("information : ", {
      sandBoxId,
      userPrompt,
      messages,
    });

    const res = await axios.post("http://localhost:3000/chat", {
      prompt: userPrompt,
      sandboxId: sandBoxId,
      messages: messages,
    });

    console.log("output : ", res.data);

    if (res.data.url) {
      setTimeout(() => {
        setProjectUrl(res.data.url);
        setSandBoxId(res.data.sandboxId);
        setMessages(res.data.messages);
      }, 3000);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground ">
      {/*<div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-[#2d2d2d]">
        <input
          className="flex-1 px-2 py-1 rounded bg-background text-foreground outline-none"
          placeholder="Enter prompt..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <button onClick={handleChat} className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium">
          Submit
        </button>
        <button
          onClick={fetchFiles}
          className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
        >
          Refresh Files
        </button>
      </div>*/}

      <ResizablePanelGroup direction="horizontal" className="max-w-full rounded-lg border ">
        <ResizablePanel defaultSize={25} className="p-3">
          <ChatComponent
            {...{
              userPrompt,
              setUserPrompt,
              handleChat,
              messages,
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
