"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeViewerProps {
  fileName: string;
  code: string;
  language?: string;
}

export function CodeViewer({ fileName, code, language = "javascript" }: CodeViewerProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-[#2d2d2d] text-gray-300 text-sm flex justify-between items-center font-mono">
        <span>{fileName}</span>
      </div>

      {/* Monaco Editor (read-only) */}
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={code}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: true,
          domReadOnly: true,
        }}
      />
    </div>
  );
}
