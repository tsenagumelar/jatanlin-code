"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProcessingModule from "@/src/modules/processing";

export default function ProcessingClickerFullscreenPage() {
  const router = useRouter();

  const handleExit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Failed to exit fullscreen:", error);
      }
    }
    router.push("/processing");
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleExit();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const exitTarget = sessionStorage.getItem("processing-exit-target");
        if (exitTarget === "verify") {
          sessionStorage.removeItem("processing-exit-target");
          return;
        }
        router.push("/processing");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.error("Failed to enter fullscreen:", error);
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleExit, router]);

  return (
    <div className="relative h-screen w-screen">
      <button
        type="button"
        onClick={handleExit}
        aria-label="Keluar fullscreen"
        className="fixed top-6 right-6 z-50 h-10 w-10 rounded-full border-2 border-red-500 bg-red-900 text-white font-bold"
      >
        X
      </button>
      <ProcessingModule variant="simple" />
    </div>
  );
}
