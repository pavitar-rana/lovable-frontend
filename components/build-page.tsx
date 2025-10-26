import dynamic from "next/dynamic";
import { useState } from "react";
import { TreeComponent } from "./tree-component";
import axios from "axios";
import type { ModelMessage } from "ai";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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
        <button
          onClick={fetchFiles}
          className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
        >
          Refresh Files
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden w-screen">
        <ResizablePanelGroup direction="horizontal" className="max-w-screen rounded-lg border md:min-w-[450px]">
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={25}>
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
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={75}>
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
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a file to view code
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            {projectUrl ? (
              <iframe title="Live Preview" className="w-full h-full border-0" src={projectUrl} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Waiting for project to build...
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>

        {/*<main className="w-[35%] border-r border-gray-700 flex flex-col">

        </main>*/}

        {/* Right: Live Preview (50%) */}
        {/*<section className="w-[50%] bg-background">

        </section>*/}
      </div>
    </div>
  );
};

export default BuilderPage;
