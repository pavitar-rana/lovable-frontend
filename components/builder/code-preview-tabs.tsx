import dynamic from "next/dynamic";
import { TreeComponent } from "../tree-component";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const CodePreviewTabs = ({
  tree,
  selectedFile,
  setSelectedFile,
  files,
  projectUrl,
}: {
  tree: any;
  selectedFile: any;
  setSelectedFile: React.Dispatch<React.SetStateAction<{ fileName: string; code: string } | null>>;
  files: { path: string; code: string }[];
  projectUrl: string;
}) => {
  return (
    <Tabs defaultValue="codeview" className="w-full h-full">
      <TabsList>
        <TabsTrigger value="codeview">Code</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="codeview">
        <ResizablePanelGroup direction="horizontal" className="max-w-screen rounded-lg border md:min-w-[450px]">
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
              <div className="flex items-center justify-center h-full text-gray-500">Select a file to view code</div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
      <TabsContent value="preview">
        {projectUrl ? (
          <iframe title="Live Preview" className="w-full h-full border-0" src={projectUrl} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Waiting for project to build...</div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export { CodePreviewTabs };
