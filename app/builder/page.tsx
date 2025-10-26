"use client";

import { use, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";

import BuilderPage from "@/components/build-page";
import { useRouter } from "next/navigation";

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

  const [sandBoxId, setSandBoxId] = useState<string>("");
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [tree, setTree] = useState<Record<string, Item>>();
  const [projectId, setProjectId] = useState<string>("");
  const [files, setFiles] = useState<{ path: string; code: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ fileName: string; code: string } | null>(null);

  // useEffect(() => {
  //   const startProject = async (id: string) => {
  //     const res = await axios.get(`http://localhost:3002/api/start-app?id=${id}`);

  //     if (res.data.url) {
  //       setProjectUrl(res.data.url);
  //     }
  //   };

  //   if (id && id !== "new") {
  //     setProjectId(id);
  //     startProject(id);
  //   } else {
  //     const newId = uuid();
  //     setProjectId(newId);
  //     router.replace(`/builder/${newId}`);
  //   }
  // }, [id, router]);

  const fetchFiles = useCallback(async () => {
    if (!sandBoxId) return;

    try {
      const res = await axios.post("http://localhost:3000/files", {
        sandboxId: sandBoxId,
      });

      const { files: fetchedFiles, tree: fileTree, error } = res.data;
      console.log("res ", res.data);

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
      console.error("Failed to fetch files:", err);
    }
  }, [sandBoxId]);

  useEffect(() => {
    if (sandBoxId) {
      const interval = setInterval(() => {
        fetchFiles();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchFiles, sandBoxId]);

  return (
    <div>
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
        }}
      />
    </div>
  );
}
