"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How do I set up the app?",
  "Which platforms are compatible with the app?",
  "System requirements",
  "How do I report a technical issue?",
  "How do I connect MetaTrader accounts?",
];

const MarkdownMessage = React.memo(({ content }: { content: string }) => {
  const markdownComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-base font-bold mb-2 text-gray-900">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-sm font-bold mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xs font-bold mb-1 text-gray-900">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-2 last:mb-0 text-sm leading-relaxed text-gray-900">
        {children}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-sm leading-relaxed text-gray-900 [&>p]:inline [&>p]:m-0">
        {children}
      </li>
    ),
    code: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <span className="font-mono text-sm text-gray-900" {...props}>
        {children}
      </span>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-2 whitespace-pre-wrap text-sm text-gray-900">
        {children}
      </div>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="mb-2 border-gray-300" />,
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownMessage.displayName = "MarkdownMessage";

export const AIAssistantScreen = React.memo(() => {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateViewportHeight = useCallback(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const h = Math.round(vv.height);
    document.documentElement.style.setProperty("--chat-dvh", `${h}px`);
  }, []);

  useEffect(() => {
    if (!isClient || !window.visualViewport) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewportHeight, 150);
    };
    updateViewportHeight();
    const vv = window.visualViewport;
    vv.addEventListener("resize", debouncedUpdate);
    return () => {
      vv.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
      document.documentElement.style.removeProperty("--chat-dvh");
    };
  }, [isClient, updateViewportHeight]);

  const onInputFocus = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && hasStartedChat && messages.length > 0) {
      setTimeout(scrollToBottom, 150);
    }
  }, [messages, hasStartedChat, scrollToBottom, isClient]);

  useEffect(() => {
    if (isClient && hasStartedChat) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [hasStartedChat, isClient]);

  useEffect(() => {
    if (!isClient) return;
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const lockScroll = () => {
      if (window.scrollY !== 0) {
        requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    };
    window.addEventListener("scroll", lockScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      window.removeEventListener("scroll", lockScroll, { capture: true });
  }, [isClient]);

  const sendToAI = useCallback(async (message: string): Promise<string> => {
    try {
      const response = await fetch("/api/public/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.fallback) {
          return data.error;
        }
        throw new Error(data.error || "Error processing your query");
      }

      return data.response;
    } catch {
      return "Sorry, I'm experiencing technical difficulties at the moment. Please try again in a few minutes.";
    }
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (text.trim() === "" || isTyping) {
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: text,
        isBot: false,
        timestamp: new Date(),
      };

      if (!hasStartedChat) {
        setHasStartedChat(true);
      }

      setMessages((prev) => {
        return [...prev, userMessage];
      });
      setInputMessage("");
      setIsTyping(true);

      if (isClient) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);

        setTimeout(scrollToBottom, 100);
      }

      try {
        const response = await sendToAI(text);

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);

        setTimeout(scrollToBottom, 200);
      } catch {
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process your query at this time. Please try again.",
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorResponse]);

        setTimeout(scrollToBottom, 200);
      } finally {
        setIsTyping(false);
        if (isClient) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      }
    },
    [sendToAI, hasStartedChat, scrollToBottom, isClient, isTyping]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage(inputMessage);
    },
    [inputMessage, handleSendMessage]
  );

  if (!hasStartedChat) {
    const inputForm = (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center p-1 gap-3 md:gap-3 bg-gray-100 rounded-full border-gray-200 border">
          <Input
            value={inputMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputMessage(e.target.value)
            }
            onFocus={onInputFocus}
            placeholder="Ask anything about IPTRADE"
            className="flex-1 border-0 shadow-none placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base bg-transparent"
            autoFocus
          />
          {inputMessage.trim() !== "" && !isTyping && (
            <button
              type="submit"
              className="text-gray-400 hover:text-gray-600 border border-gray-200 transition-colors cursor-pointer rounded-full bg-white p-1 mr-1"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    );

    return (
      <div className="h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-2">
          <h2 className="text-xl md:text-2xl text-center text-gray-400">
            Talk to Ugo assistant
          </h2>
          <p className="text-xs text-gray-400 text-center mt-2 px-12">
            IPTRADE AI can make mistakes. Verify important information.
          </p>
          <div className="hidden md:block w-full max-w-xl mt-4 relative pb-[calc(10vh)]">
            {inputForm}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  disabled={isTyping}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:text-gray-700 text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="md:hidden shrink-0 w-full px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 bg-white">
          <div className="max-w-3xl mx-auto w-full space-y-3">
            <div className="flex flex-col items-end gap-3">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  disabled={isTyping}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:text-gray-700 text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {question}
                </button>
              ))}
            </div>
            {inputForm}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-72px)] flex flex-col overflow-hidden">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 min-h-0"
        scrollbar="none"
      >
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 py-4  px-1">
          {messages.map((message, index: number) => (
            <div
              key={message.id}
              className={`flex gap-3 md:gap-3 ${
                message.isBot ? "justify-start" : "justify-end"
              }
                ${index === 0 && !message.isBot ? "pt-2" : ""}
              `}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-3 py-1 ${
                  message.isBot ? "" : "  rounded-full text-white bg-black"
                }`}
              >
                <div className="text-sm">
                  {message.isBot ? (
                    <MarkdownMessage content={message.text} />
                  ) : (
                    <div className="whitespace-pre-line">{message.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 md:gap-3 justify-start">
              <div className="rounded-lg px-3 py-1">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0 pt-2 md:pt-4 bg-white w-full pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4">
        <div className="max-w-3xl mx-auto w-full px-1">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center p-1 gap-3 md:gap-3 bg-gray-100 rounded-full border-gray-200 border">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputMessage(e.target.value)
                }
                onFocus={onInputFocus}
                placeholder="Ask anything about IPTRADE"
                className="flex-1 border-0 shadow-none placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base bg-transparent py-0"
              />
              {inputMessage.trim() !== "" && !isTyping && (
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-600 border border-gray-200 transition-colors cursor-pointer rounded-full bg-white p-1 mr-1"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              IPTRADE AI can make mistakes. Verify important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
});

AIAssistantScreen.displayName = "AIAssistantScreen";
