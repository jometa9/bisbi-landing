"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "loading" | "ready" | "playing" | "done";

const HAVE_FUTURE_DATA = 3;
const HAVE_METADATA = 1;

const LOADING_TIMEOUT_MS = 6000;
const MIN_LOADING_MS = 5000;

export function MidnightIntro({
  videoSrc,
  children,
}: {
  videoSrc: string;
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountTimeRef = useRef<number>(0);
  const minTimeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  const goReady = useCallback(() => {
    setPhase("ready");
  }, []);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    return () => {
      if (minTimeTimeoutRef.current) clearTimeout(minTimeTimeoutRef.current);
    };
  }, []);

  const scheduleReady = useCallback(() => {
    const elapsed = Date.now() - mountTimeRef.current;
    if (elapsed >= MIN_LOADING_MS) {
      goReady();
      return;
    }
    if (minTimeTimeoutRef.current) return;
    minTimeTimeoutRef.current = setTimeout(() => {
      minTimeTimeoutRef.current = null;
      goReady();
    }, MIN_LOADING_MS - elapsed);
  }, [goReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || phase !== "loading") return;

    const isMobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    if (video.readyState >= HAVE_FUTURE_DATA) {
      scheduleReady();
      return;
    }

    if (isMobile && video.readyState >= HAVE_METADATA) {
      scheduleReady();
      return;
    }

    const timeoutId = setTimeout(scheduleReady, LOADING_TIMEOUT_MS);

    const onCanPlay = () => {
      clearTimeout(timeoutId);
      scheduleReady();
    };

    video.addEventListener("canplaythrough", onCanPlay);
    video.addEventListener("canplay", onCanPlay);
    if (isMobile) video.addEventListener("loadedmetadata", onCanPlay);

    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener("canplaythrough", onCanPlay);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadedmetadata", onCanPlay);
    };
  }, [phase, goReady, scheduleReady]);

  const handleStartClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setPhase("playing");
    video.play().catch(() => setPhase("ready"));
  }, []);

  const handleEnded = useCallback(() => {
    setPhase("done");
  }, []);

  if (phase === "done") {
    return <>{children}</>;
  }

  const isPlaying = phase === "playing";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black "
      style={isPlaying ? { filter: "none" } : undefined}
    >
      <div className={isPlaying ? "w-full max-w-4xl mx-auto px-6" : "hidden"}>
        <video
          ref={videoRef}
          src={videoSrc}
          preload="auto"
          playsInline
          muted={false}
          onEnded={handleEnded}
          style={{ filter: "grayscale(100%)" }}
          className={
            isPlaying
              ? "w-full h-auto object-contain block"
              : "hidden"
          }
        />
      </div>

      {!isPlaying && phase === "loading" && (
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-2xl  text-white animate-midnight-fade">
            瞬写
          </span>
        </div>
      )}

      {!isPlaying && phase === "ready" && (
        <button
          type="button"
          onClick={handleStartClick}
          className="text-2xl   text-white/90 hover:text-white transition-colors cursor-pointer border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
        >
          Start
        </button>
      )}
    </div>
  );
}
