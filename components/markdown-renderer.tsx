"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

function DownloadLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:opacity-80 transition-opacity"
      style={{ color: "#7BA89C" }}
    >
      {children}
    </a>
  );
}

function MailtoAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const email = href.replace(/^mailto:/i, "").split("?")[0].trim();
  const handleClick = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <a href={href} onClick={handleClick} className={`cursor-pointer ${className ?? ""}`}>
      {copied ? "Copied to clipboard" : children}
    </a>
  );
}

function getYouTubeVideoId(url: string): string | null {
  if (!url || !url.includes("youtube") && !url.includes("youtu.be")) return null;
  try {
    const u = new URL(url, "https://youtube.com");
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] || null;
    return u.searchParams.get("v") || u.pathname.split("/").pop()?.split("?")[0] || null;
  } catch {
    return null;
  }
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <span className="my-4 block aspect-video w-full max-w-3xl overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || "YouTube video"}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </span>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string | undefined
  ) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      const id = href.substring(1);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  };

  return (
    <div className="markdown-content max-w-none" style={{ color: "#5C5C57" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: ({ id, ...props }) => (
            <h1
              id={id}
              className="text-3xl md:text-4xl font-semibold tracking-tight mt-8 mb-4 scroll-mt-24 leading-tight"
              style={{ color: "#1A1A18" }}
              {...props}
            />
          ),
          h2: ({ id, ...props }) => (
            <h2
              id={id}
              className="text-2xl md:text-3xl font-semibold tracking-tight mt-6 mb-3 scroll-mt-24"
              style={{ color: "#1A1A18" }}
              {...props}
            />
          ),
          h3: ({ id, ...props }) => (
            <h3
              id={id}
              className="text-xl font-semibold tracking-tight mt-5 mb-2 scroll-mt-24"
              style={{ color: "#1A1A18" }}
              {...props}
            />
          ),
          h4: ({ id, ...props }) => (
            <h4
              id={id}
              className="text-lg font-semibold tracking-tight mt-4 mb-2 scroll-mt-24"
              style={{ color: "#1A1A18" }}
              {...props}
            />
          ),
          p: ({ children, ...props }) => (
            <p className="my-3 leading-relaxed" style={{ color: "#5C5C57" }} {...props}>
              {children}
            </p>
          ),
          strong: ({ ...props }) => (
            <strong style={{ color: "#1A1A18" }} {...props} />
          ),
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            const isAnchor = href?.startsWith("#");
            const isMailto = href?.startsWith("mailto:");
            const isDownloadEndpoint =
              href?.startsWith("/api/download") ?? false;
            if (isMailto && href) {
              return (
                <MailtoAnchor
                  href={href}
                  className="underline cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span style={{ color: "#7BA89C" }}>{children}</span>
                </MailtoAnchor>
              );
            }
            if (isDownloadEndpoint && href) {
              return (
                <DownloadLink href={href} {...props}>
                  {children}
                </DownloadLink>
              );
            }
            return (
              <a
                href={href}
                {...props}
                onClick={(e) => {
                  if (isAnchor) {
                    handleAnchorClick(e, href);
                  }
                  props.onClick?.(e);
                }}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="underline cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: "#7BA89C" }}
              >
                {children}
              </a>
            );
          },
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside space-y-2 ml-4 mt-0.5 leading-relaxed"
              style={{ color: "#5C5C57" }}
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside space-y-2 ml-4 mt-0.5 leading-relaxed"
              style={{ color: "#5C5C57" }}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li {...props} className="my-2 leading-relaxed" style={{ color: "#5C5C57" }} />
          ),
          img: ({ src, alt, ...props }) => {
            const videoId = typeof src === "string" ? getYouTubeVideoId(src) : null;
            if (videoId) {
              return <YouTubeEmbed videoId={videoId} title={alt || undefined} />;
            }
            return (
              <img
                src={src}
                alt={alt || ""}
                className="rounded-lg w-full max-w-3xl h-auto my-4"
                {...props}
              />
            );
          },
          iframe: ({ ...props }: React.ComponentPropsWithoutRef<"iframe">) => (
            <iframe
              {...props}
              className="w-full my-4 rounded-lg"
              allowFullScreen
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                {...props}
                className="min-w-full border-collapse"
                style={{ border: "1px solid #E8E6E1" }}
              />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              {...props}
              className="px-3 py-2 font-semibold text-left"
              style={{
                border: "1px solid #E8E6E1",
                backgroundColor: "#F7F5F0",
                color: "#1A1A18",
              }}
            />
          ),
          td: ({ ...props }) => (
            <td
              {...props}
              className="px-3 py-2"
              style={{ border: "1px solid #E8E6E1", color: "#5C5C57" }}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-6" style={{ borderColor: "#E8E6E1" }} {...props} />
          ),
          pre: ({ children }) => (
            <div
              className="my-2 whitespace-pre-wrap text-sm leading-relaxed"
              style={{ color: "#5C5C57" }}
            >
              {children}
            </div>
          ),
          code: ({ children }) => (
            <span className="font-mono text-sm" style={{ color: "#1A1A18" }}>
              {children}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
