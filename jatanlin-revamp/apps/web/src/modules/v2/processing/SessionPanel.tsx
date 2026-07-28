/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Button, Spinner } from "@fluentui/react-components";
import {
  Play20Regular,
  Stop20Regular,
  CheckmarkCircle20Filled,
  Warning20Regular,
  Circle12Filled,
  Timer20Regular,
} from "@fluentui/react-icons";
import { useProcessing } from "@/src/contexts/ProcessingContext";

// ── GraphQL ───────────────────────────────────────────────────────────────────
const GET_ACTIVE_SESSION = gql`
  query GetActiveSession($site_id: uuid!) {
    transact_wim_session(
      where: {
        site_id: { _eq: $site_id }
        status: { _eq: "IN_PROGRESS" }
        is_active: { _eq: true }
        is_deleted: { _eq: false }
      }
      order_by: { started_at: desc }
      limit: 1
    ) {
      id
      code
      session_name
      status
      started_at
      processed_vehicles
      notes
    }
  }
`;

const CREATE_SESSION = gql`
  mutation CreateSession($site_id: uuid!, $session_name: String, $code: String!) {
    insert_transact_wim_session_one(
      object: {
        site_id: $site_id
        status: "IN_PROGRESS"
        session_name: $session_name
        is_active: true
        is_deleted: false
      }
    ) {
      id
      code
      started_at
      status
    }
  }
`;

const END_SESSION = gql`
  mutation EndSession($id: uuid!) {
    update_transact_wim_session_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "COMPLETED"
        ended_at: "now()"
        is_active: false
      }
    ) {
      id
      code
      status
      ended_at
    }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function useDuration(startedAt: string | null | undefined): string {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!startedAt) { setSecs(0); return; }
    const compute = () => {
      const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setSecs(Math.max(0, diff));
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}j ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}d`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const SessionPanel: React.FC = () => {
  const { setSessionStatus, setSessionId } = useProcessing();
  const siteId = process.env.NEXT_PUBLIC_SITE_ID ?? "";

  const [creating, setCreating]     = useState(false);
  const [ending, setEnding]         = useState(false);
  const [sessionName, setSessionName] = useState("");

  const { data, loading, refetch } = useQuery(GET_ACTIVE_SESSION, {
    variables: { site_id: siteId },
    pollInterval: 5_000,
    fetchPolicy: "network-only",
    skip: !siteId,
  });

  const [createSession] = useMutation(CREATE_SESSION);
  const [endSession]    = useMutation(END_SESSION);

  const activeSession = data?.transact_wim_session?.[0] ?? null;
  const duration = useDuration(activeSession?.started_at);

  // Sync to ProcessingContext
  useEffect(() => {
    if (activeSession) {
      setSessionStatus("IN_PROGRESS");
      setSessionId(activeSession.id);
    } else {
      setSessionStatus("IDLE");
      setSessionId(null);
    }
  }, [activeSession, setSessionStatus, setSessionId]);

  const handleStart = async () => {
    if (!siteId) return;
    setCreating(true);
    try {
      const now = new Date();`r`n      const name = sessionName.trim() || `Sesi ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
      await createSession({ variables: { site_id: siteId, session_name: name, code: formatSessionCode(now) } });
      setSessionName("");
      await refetch();
    } catch (e: any) {
      console.error("Gagal membuat sesi:", e?.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    setEnding(true);
    try {
      await endSession({ variables: { id: activeSession.id } });
      await refetch();
    } catch (e: any) {
      console.error("Gagal mengakhiri sesi:", e?.message);
    } finally {
      setEnding(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 px-1 py-2">
        <Spinner size="tiny" />
        Mengecek sesi aktif…
      </div>
    );
  }

  // ── Active session view ────────────────────────────────────────────────────
  if (activeSession) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Circle12Filled className="w-2.5 h-2.5 text-green-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-green-700">Live</span>
        </div>

        {/* Session info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-green-800 font-mono">
              {activeSession.code}
            </span>
            {activeSession.session_name && (
              <span className="text-xs text-green-700">· {activeSession.session_name}</span>
            )}
            <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
              IN_PROGRESS
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1 text-[10px] text-green-600">
              <Timer20Regular className="w-3 h-3" />
              <span className="font-mono font-semibold">{duration}</span>
            </div>
            <div className="text-[10px] text-green-600">
              {activeSession.processed_vehicles ?? 0} kendaraan diproses
            </div>
            <div className="text-[10px] text-green-500">
              Mulai: {new Date(activeSession.started_at).toLocaleTimeString("id-ID")}
            </div>
          </div>
        </div>

        {/* End button */}
        <Button
          appearance="subtle"
          size="small"
          icon={ending ? <Spinner size="tiny" /> : <Stop20Regular />}
          onClick={handleEnd}
          disabled={ending}
          style={{ color: "#dc2626", border: "1px solid #fca5a5" }}
        >
          {ending ? "Mengakhiri…" : "Selesai Sesi"}
        </Button>
      </div>
    );
  }

  // ── No session — start view ────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Circle12Filled className="w-2.5 h-2.5 text-slate-300" />
        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Idle</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-600">Belum ada sesi aktif</p>
        <p className="text-[10px] text-slate-400">
          Mulai sesi agar backend watcher dapat memproses data dari kamera ANPR & AXLE
        </p>
      </div>

      {/* Optional session name input */}
      <input
        type="text"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleStart()}
        placeholder="Nama sesi (opsional)"
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 w-44 shrink-0"
        disabled={creating}
      />

      {/* Start button */}
      <Button
        appearance="primary"
        size="small"
        icon={creating ? <Spinner size="tiny" /> : <Play20Regular />}
        onClick={handleStart}
        disabled={creating || !siteId}
      >
        {creating ? "Membuat Sesi…" : "Mulai Sesi"}
      </Button>

      {!siteId && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600">
          <Warning20Regular className="w-3 h-3" />
          NEXT_PUBLIC_SITE_ID tidak dikonfigurasi
        </div>
      )}
    </div>
  );
};

export default SessionPanel;




