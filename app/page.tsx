"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send, Sparkles, FolderOpen } from "lucide-react";
import type { Project } from "@/lib/generated/prisma/browser";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await axios.get("/api/get-projects", {
          headers: {
            userId: session?.user?.id,
          },
        });
        toast.success("Fetched all projects");
        setProjects(res.data.projects || []);
      } catch (error) {
        toast.error("Failed to get projects");
      }
    };

    if (status === "authenticated") {
      fetchProject();
    }
  }, [session, status]);

  const handleCreate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      console.log("Creating project with prompt:", prompt);
      router.push(`/builder/new/?query=${prompt}`);

      setPrompt("");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/builder/${projectId}`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Create Something Amazing</h1>
          </div>
          <p className="text-muted-foreground text-lg">Start with a prompt and bring your ideas to life</p>
        </div>

        {/* Prompt Input Section */}
        <div className="mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-card rounded-lg border border-border overflow-hidden transition-all hover:border-input">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your project idea... (e.g., 'Create a task management app with drag and drop')"
                className="w-full px-6 py-5 text-lg resize-none focus:outline-none min-h-[120px] bg-card text-card-foreground placeholder:text-muted-foreground"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && prompt.trim() && !isLoading) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <div className="flex items-center justify-between px-6 py-4 bg-muted border-t border-border">
                <p className="text-sm text-muted-foreground font-mono">{prompt.length} characters</p>
                <button
                  type="button"
                  disabled={!prompt.trim() || isLoading}
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        {projects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-6 h-6 text-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
              <span className="px-3 py-1 bg-accent text-accent-foreground font-mono text-sm font-medium">
                {projects.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: Project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="group bg-card border border-border p-6 cursor-pointer transition-all hover:border-primary hover:bg-accent"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                      <FolderOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">#{project.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-accent-foreground transition-colors">
                    {project.name}
                  </h3>
                  {project.createdAt && (
                    <p className="text-sm text-muted-foreground font-mono">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && status === "authenticated" && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground">Start by creating your first project above</p>
          </div>
        )}
      </div>
    </div>
  );
}
