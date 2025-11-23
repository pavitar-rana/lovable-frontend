import { Divide } from "lucide-react";
import { PromptInputComp } from "./prompt-input";
import type { ModelMessage } from "ai";
import { useEffect, useRef } from "react";

// Simple Markdown renderer component
const MarkdownText = ({ text }: { text: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Simple markdown parsing
      let html = text
        // Escape HTML to prevent XSS
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headers
        .replace(/^### (.*$)/gim, "<h3 class='text-lg font-semibold mt-3 mb-2'>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2 class='text-xl font-semibold mt-4 mb-2'>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold mt-4 mb-3'>$1</h1>")
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<strong class='font-bold'>$1</strong>")
        .replace(/__(.+?)__/g, "<strong class='font-bold'>$1</strong>")
        // Italic
        .replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>")
        .replace(/_(.+?)_/g, "<em class='italic'>$1</em>")
        // Code blocks
        .replace(
          /```(\w+)?\n([\s\S]*?)```/g,
          "<pre class='bg-slate-800 text-slate-100 rounded p-3 my-2 overflow-x-auto'><code>$2</code></pre>",
        )
        // Inline code
        .replace(
          /`(.+?)`/g,
          "<code class='bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>",
        )
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          "<a href='$2' class='text-blue-500 hover:text-blue-600 underline' target='_blank' rel='noopener noreferrer'>$1</a>",
        )
        // Line breaks
        .replace(/\n\n/g, "</p><p class='mb-2'>")
        .replace(/\n/g, "<br/>")
        // Lists
        .replace(/^\* (.+)$/gim, "<li class='ml-4'>• $1</li>")
        .replace(/^- (.+)$/gim, "<li class='ml-4'>• $1</li>")
        .replace(/^\d+\. (.+)$/gim, "<li class='ml-4 list-decimal'>$1</li>");

      // Wrap in paragraph if not already wrapped
      if (!html.startsWith("<")) {
        html = `<p class='mb-2'>${html}</p>`;
      }

      contentRef.current.innerHTML = html;
    }
  }, [text]);

  return <div ref={contentRef} className="markdown-content" />;
};

const ChatComponent = ({
  userPrompt,
  setUserPrompt,
  handleChat,
  messages,
  loading,
  logs,
}: {
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  userPrompt: string;
  handleChat: any;
  messages: ModelMessage[];
  loading: boolean;
  logs: { name: string; content: string }[];
}) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages Area */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">Start a conversation by typing a message below</div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="text-sm font-medium mb-1">{message.role === "user" ? "You" : "Assistant"}</div>
                <div className="whitespace-pre-wrap">
                  {(() => {
                    if (typeof message.content === "string") {
                      try {
                        const parsed = JSON.parse(message.content);
                        if (Array.isArray(parsed)) {
                          // Group tool calls with their corresponding results
                          const groupedActions: any[] = [];

                          for (let i = 0; i < parsed.length; i++) {
                            const item = parsed[i];
                            if (item.type === "tool-call") {
                              // Look for the corresponding tool result
                              const correspondingResult = parsed.find(
                                (result, resultIndex) =>
                                  resultIndex > i &&
                                  result.type === "tool-result" &&
                                  result.toolCallId === item.toolCallId,
                              );

                              groupedActions.push({
                                toolCall: item,
                                toolResult: correspondingResult,
                                type: "tool-action",
                              });
                            } else if (item.type === "tool-result") {
                              // Skip standalone tool results as they should be grouped with their calls
                              const hasCorrespondingCall = parsed.some(
                                (call, callIndex) =>
                                  callIndex < i && call.type === "tool-call" && call.toolCallId === item.toolCallId,
                              );
                              if (!hasCorrespondingCall) {
                                groupedActions.push(item);
                              }
                            } else {
                              // Regular text or other content
                              groupedActions.push(item);
                            }
                          }

                          return (
                            <div className="space-y-2">
                              {groupedActions.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                  {typeof item === "string" ? (
                                    <MarkdownText text={item} />
                                  ) : item.type === "text" ? (
                                    <MarkdownText text={item.text} />
                                  ) : item.type === "tool-action" ? (
                                    <div className="bg-gray-300 border border-slate-200 rounded-lg p-3 text-sm">
                                      {item.toolCall.toolName === "updateFile" ? (
                                        <div className="flex items-center font-medium text-slate-800 mb-2">
                                          <div>Updating : </div>
                                          {item.toolCall.input?.location && (
                                            <div className="text-slate-600 ">
                                              {item.toolCall.input.location.startsWith("/home/user/")
                                                ? item.toolCall.input.location.split("/home/user/")[1]
                                                : item.toolCall.input.location}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center font-medium text-slate-800 mb-2">
                                          <div>
                                            Running :{" "}
                                            {item.toolCall.input?.command && (
                                              <div className="text-slate-600 ">{item.toolCall.input.command}</div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : item.type === "tool-result" ? (
                                    <div className="bg-green-500 border border-green-200 rounded-lg p-3 text-sm">
                                      <div className="flex items-center gap-2 font-medium text-green-800">
                                        {item.output || "Completed"}
                                      </div>
                                    </div>
                                  ) : (
                                    // : item.type === "tool-error" ? (
                                    //   (() => {
                                    //     if (item.error) {
                                    //       console.error("Tool Error:", item.error);
                                    //     }
                                    //     return (
                                    //       <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-700">
                                    //         <div className="flex items-center gap-2 font-medium"> Tool Error</div>
                                    //         <div>{item.error || "An error occurred while executing the tool."}</div>
                                    //       </div>
                                    //     );
                                    //   })()
                                    // )
                                    <div className="bg-gray-500 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                                      Unknown content type: {item.type || "undefined"}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          return <MarkdownText text={message.content} />;
                        }
                      } catch (e) {}
                      return <MarkdownText text={message.content} />;
                    }

                    // Handle array content
                    if (Array.isArray(message.content)) {
                      // Group tool calls with their corresponding results
                      const groupedActions: any[] = [];

                      for (let i = 0; i < message.content.length; i++) {
                        const item = message.content[i];
                        if (item.type === "tool-call") {
                          // Look for the corresponding tool result
                          const correspondingResult = message.content.find(
                            (result, resultIndex) =>
                              resultIndex > i && result.type === "tool-result" && result.toolCallId === item.toolCallId,
                          );

                          groupedActions.push({
                            toolCall: item,
                            toolResult: correspondingResult,
                            type: "tool-action",
                          });
                        } else if (item.type === "tool-result") {
                          // Skip standalone tool results as they should be grouped with their calls
                          const hasCorrespondingCall = message.content.some(
                            (call, callIndex) =>
                              callIndex < i && call.type === "tool-call" && call.toolCallId === item.toolCallId,
                          );
                          if (!hasCorrespondingCall) {
                            groupedActions.push(item);
                          }
                        } else {
                          // Regular text or other content
                          groupedActions.push(item);
                        }
                      }

                      return (
                        <div className="space-y-2">
                          {groupedActions.map((item, itemIndex) => (
                            <div key={itemIndex}>
                              {typeof item === "string" ? (
                                <MarkdownText text={item} />
                              ) : item.type === "text" ? (
                                <MarkdownText text={item.text} />
                              ) : item.type === "tool-action" ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                                  <div className="flex items-center gap-2 font-medium text-slate-800 mb-2">
                                    🔧 {item.toolCall.toolName}
                                  </div>
                                  {item.toolCall.input?.location && (
                                    <div className="text-slate-600 mb-2">📁 {item.toolCall.input.location}</div>
                                  )}
                                  {item.toolResult && (
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded px-2 py-1">
                                      {item.toolResult.output || "Completed"}
                                    </div>
                                  )}
                                </div>
                              ) : item.type === "tool-result" ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                  <div className="flex items-center gap-2 font-medium text-green-800">
                                    {item.output || "Completed"}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                                  Unknown content type: {item.type || "undefined"}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Fallback for other types
                    return <div className="text-gray-500 text-sm">{JSON.stringify(message.content)}</div>;
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prompt Input at Bottom */}
      <div className="p-4 border-t">
        {/* Logs area with autoscroll */}
        <div
          className="mb-0.5 max-h-40 overflow-y-auto bg-black rounded-lg border border-gray-800 p-2 font-mono text-xs text-green-400"
          style={{
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.25)",
          }}
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center">No logs yet.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">
                <span className="text-green-500">$</span> <span className="text-green-300">{log.name}</span>
                {log.content && <span className="text-green-400">: {log.content}</span>}
              </div>
            ))
          )}
        </div>
      </div>
      <PromptInputComp
        {...{
          userPrompt,
          setUserPrompt,
          handleChat,
          loading,
        }}
      />
    </div>
  );
};

export { ChatComponent };
