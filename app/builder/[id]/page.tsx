"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";

import { v4 as uuid } from "uuid";
import { useSession } from "next-auth/react";

import BuilderPage from "@/components/builder/build-page";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ModelMessage } from "ai";
import { toast } from "sonner";

export type Item = {
  name: string;
  children?: string[];
};

type BuilderProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function Builder({ params }: BuilderProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams?.get("query");
  const { data: session, status } = useSession();

  const [sandBoxId, setSandBoxId] = useState<string>("");
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [tree, setTree] = useState<Record<string, Item>>();
  const [projectId, setProjectId] = useState<string>("");
  const [files, setFiles] = useState<{ path: string; code: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ fileName: string; code: string } | null>(null);
  const starterRef = useRef<boolean>(false);

  useEffect(() => {
    const startProject = async (id: string) => {
      toast.promise<{ projectId: string }>(
        async () => {
          const res = await axios.get(`http://localhost:3000/startProject/${id}`, {
            headers: {
              userId: session?.user?.id,
            },
          });
          await new Promise((resolve) => {
            setTimeout(() => {
              setProjectUrl(res.data.url);
              setSandBoxId(res.data.sandboxId);
              setMessages(res.data.messages);
              resolve(undefined);
            }, 2000);
          });
          return { projectId: res.data.projectId };
        },
        {
          loading: "Loading...",
          success: (data) => `${data.projectId} has been started`,
          error: "Error",
        },
      );
    };
    // console.log("from use effect sandBoxId : ", sandBoxId);
    // console.log("from use effect id  : ", id);
    // console.log("from use effect messages : ", messages);

    if (!sandBoxId && session?.user?.id && messages.length === 0 && starterRef.current == false) {
      if (id && id !== "new") {
        // console.log("running start project with sandBoxId : ", sandBoxId);
        setProjectId(id);
        startProject(id);
        starterRef.current = true;
      } else {
        const newId = uuid();
        setProjectId(newId);
      }
    }
  }, [id, router, sandBoxId, session, messages, status]);

  const fetchFiles = useCallback(async () => {
    if (!sandBoxId || !projectId) return;

    try {
      const res = await axios.post("http://localhost:3000/files", {
        sandboxId: sandBoxId,
        projectId,
        userId: session?.user?.id,
      });

      const { files: fetchedFiles, tree: fileTree, error } = res.data;
      // console.log("res ", res.data);

      if (error) {
        console.warn("API error:", error);
        return;
      }

      if (Array.isArray(fetchedFiles) && fetchedFiles.length > 0 && fileTree && typeof fileTree === "object") {
        setFiles(fetchedFiles);

        const topLevelPaths = Object.keys(fileTree).filter((path) => path.split("/").length === 1);

        const treeWithRoot = {
          root: { name: "root", children: topLevelPaths },
          ...fileTree,
        };
        setTree(treeWithRoot);

        setSelectedFile((prev) =>
          // !prev || prev.fileName !== fetchedFiles[0].path
          !prev ? { fileName: fetchedFiles[0].path, code: fetchedFiles[0].code } : prev,
        );
      }
    } catch (err) {
      // console.error("Failed to fetch files:", err);
      toast.error("Failed to fetch files, Retrying in 5 seconds");
    }
  }, [sandBoxId, projectId, session]);

  useEffect(() => {
    if (sandBoxId) {
      const interval = setInterval(() => {
        fetchFiles();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchFiles, sandBoxId]);

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="p-1">
        {!session?.user?.email ? <div>Please login</div> : <div>you : {session?.user?.email}</div>}{" "}
      </div>
      <div className="w-full h-full">
        {projectId ? (
          <BuilderPage
            {...{
              userPrompt,
              setUserPrompt,
              files,
              tree,
              fetchFiles,
              selectedFile,
              projectId,
              setProjectId,
              setSelectedFile,
              setProjectUrl,
              projectUrl,
              sandBoxId,
              setSandBoxId,
              messages,
              setMessages,
              query,
            }}
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
