"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import LedDisplay from "@/src/modules/led";

export default function LedFullscreenPage() {
  const router = useRouter();

  const handleExit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Failed to exit fullscreen:", error);
      }
    }
    router.push("/led");
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleExit();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        router.push("/led");
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

  return <LedDisplay showExitFullscreen onExitFullscreen={handleExit} />;
}
