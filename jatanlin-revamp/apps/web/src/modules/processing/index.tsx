/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { SystemInitialization } from "./SystemInitialization";
import { DataProcessing } from "./DataProcessing";
import { useProcessing } from "@/src/contexts/ProcessingContext";
import { useInsertTransactWimSessionMutation } from "@/src/graphql/hooks/transact-wim-session";

interface ProcessingModuleProps {
  variant?: "full" | "simple";
}

export const ProcessingModule: React.FC<ProcessingModuleProps> = ({
  variant = "full",
}) => {
  const { phase, setPhase, setSessionStartTime, setSessionId, setSessionStatus } =
    useProcessing();
  const [insertTransactWimSession] = useInsertTransactWimSessionMutation();
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || undefined;

  const formatSessionName = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join("");
  };

  const handleInitComplete = async (isDummyMode: boolean) => {
    const now = new Date();
    const startedAt = now.toISOString();
    const sessionName = formatSessionName(now);

    setSessionStartTime(startedAt);

    try {
      const result = await insertTransactWimSession({
        variables: {
          object: {
            session_name: sessionName,
            status: "IN_PROGRESS",
            started_at: startedAt,
            site_id: siteId,
            is_active: true,
            is_dummy: isDummyMode,
            is_deleted: false,
            created_by: "00000000-0000-0000-0000-000000000000",
            created_date: startedAt,
          },
        },
      });

      const id = result.data?.insert_transact_wim_session_one?.id;
      if (id) {
        setSessionId(id);
        setSessionStatus("IN_PROGRESS");
      }
    } catch (error) {
      console.error("Error inserting WIM session:", error);
    }

    setPhase("processing");
  };

  return (
    <div className="h-full w-full">
      {phase === "init" ? (
        <SystemInitialization onComplete={handleInitComplete} variant={variant} />
      ) : (
        <DataProcessing variant={variant} />
      )}
    </div>
  );
};

export default ProcessingModule;


