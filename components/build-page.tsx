import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { TreeComponent } from "./tree-component";
import axios from "axios";
import { BASE_PROMPT } from "@/lib/prompt";
import { useRouter } from "next/navigation";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
}: {
  userPrompt: string;
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<{ fileName: string; code: string } | null>>;
  setProjectUrl: React.Dispatch<React.SetStateAction<string>>;
  setProjectId: React.Dispatch<React.SetStateAction<string>>;
  tree: any;
  projectId: string;
  projectUrl: string;
  files: { path: string; code: string }[];
  selectedFile: any;
}) => {
  const router = useRouter();

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "user", content: BASE_PROMPT },
  ]);

  const handleChat = async () => {
    if (!userPrompt.trim()) return alert("Prompt needed");

    const newMessage = { role: "user" as const, content: userPrompt };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    const res = await axios.post("http://localhost:3002", {
      prompt: userPrompt,
      messages: updatedMessages,
      id: projectId,
    });

    if (res.data.url) {
      setProjectUrl(res.data.url);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Controls */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-[#2d2d2d]">
        <input
          className="flex-1 px-2 py-1 rounded bg-background text-foreground outline-none"
          placeholder="Enter prompt..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <button onClick={handleChat} className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium">
          Submit
        </button>
        {/*<button
          onClick={fetchFiles}
          className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
        >
          Refresh Files
        </button>*/}
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: File Tree (15%) */}
        {tree ? (
          <TreeComponent
            {...{
              tree,
              files,
              setSelectedFile,
            }}
          />
        ) : (
          <div>No tree</div>
        )}
        {/* Middle: Code Editor (35%) */}
        <main className="w-[35%] border-r border-gray-700 flex flex-col">
          <div className="px-3 py-2 bg-[#2d2d2d] text-sm font-mono border-b border-gray-700">
            {selectedFile?.fileName || "No file selected"}
          </div>

          {selectedFile ? (
            <Editor
              theme="vs-dark"
              height="100%"
              language="typescript"
              value={selectedFile.code}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Select a file to view code</div>
          )}
        </main>

        {/* Right: Live Preview (50%) */}
        <section className="w-[50%] bg-background">
          {projectUrl ? (
            <iframe title="Live Preview" className="w-full h-full border-0" src={projectUrl} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Waiting for project to build...</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BuilderPage;
