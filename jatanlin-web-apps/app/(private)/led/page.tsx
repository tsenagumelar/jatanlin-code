"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import LedDisplay from "@/src/modules/led";

export default function LedPage() {
  const router = useRouter();

  const handleEnterFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error("Failed to enter fullscreen:", error);
      }
    }
    router.push("/led/fullscreen");
  }, [router]);

  return (
    <LedDisplay
      showEnterFullscreen
      onEnterFullscreen={handleEnterFullscreen}
    />
  );
}
