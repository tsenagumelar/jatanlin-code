"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  ArrowClockwise24Regular,
  CheckmarkCircle24Filled,
  Eye24Regular,
  EyeOff24Regular,
  NetworkCheck24Regular,
  Save24Regular,
  Server24Regular,
  Settings24Regular,
  ShieldSettings24Regular,
  Warning24Filled,
} from "@fluentui/react-icons";
import { useAppSelector } from "@/src/redux/hooks";
import { getAuthTokenCookie } from "@/src/utils/auth";

type ValueType = "string" | "number" | "boolean" | "url" | "password" | "path";
type PingResult = "idle" | "testing" | "ok" | "fail" | "timeout";

interface RuntimeConfigRow {
  id: string;
  config_group: string;
  config_key: string;
  config_value: string | null;
  value_type: ValueType;
  label: string;
  description: string | null;
  is_secret: boolean;
  is_runtime_editable: boolean;
  sort_order: number;
}

interface ApplicationConfigRow {
  id: string;
  config_key: string;
  config_value: string | null;
  description: string | null;
  sort_order: number | null;
}

interface DataCenterSyncResponse {
  success: boolean;
  message?: string;
  data?: {
    counts?: Record<string, number>;
  };
}

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const GET_RUNTIME_CONFIGS = gql`
  query GetRuntimeConfigs {
    system_runtime_config(
      where: { is_deleted: { _eq: false } }
      order_by: [{ config_group: asc }, { sort_order: asc }]
    ) {
      id
      config_group
      config_key
      config_value
      value_type
      label
      description
      is_secret
      is_runtime_editable
      sort_order
    }
  }
`;

const UPSERT_RUNTIME_CONFIGS = gql`
  mutation UpsertRuntimeConfigs($objects: [system_runtime_config_insert_input!]!) {
    insert_system_runtime_config(
      objects: $objects
      on_conflict: {
        constraint: system_runtime_config_group_key_key
        update_columns: [config_value, value_type, label, description, is_secret, is_runtime_editable, sort_order, is_active, is_deleted, updated_date]
      }
    ) {
      returning {
        id
        config_group
        config_key
        config_value
      }
    }
  }
`;

const GET_APPLICATION_CONFIGS = gql`
  query GetApplicationConfigs {
    master_config(
      where: {
        config_type: { _eq: "apps" }
        is_deleted: { _eq: false }
      }
      order_by: [{ sort_order: asc }, { config_key: asc }]
    ) {
      id
      config_key
      config_value
      description
      sort_order
    }
  }
`;

const UPDATE_APPLICATION_CONFIG = gql`
  mutation UpdateApplicationConfig(
    $id: uuid!
    $config_value: String!
    $updated_by: uuid
  ) {
    update_master_config_by_pk(
      pk_columns: { id: $id }
      _set: {
        config_value: $config_value
        updated_by: $updated_by
        updated_date: "now()"
      }
    ) {
      id
      config_value
    }
  }
`;

const groupLabels: Record<string, { title: string; description: string }> = {
  SITE: {
    title: "Site Identity",
    description: "Site identifiers used by local services and reporting.",
  },
  API: {
    title: "Backend API",
    description: "Backend API port and authentication behavior.",
  },
  SERVICE: {
    title: "Service Runtime",
    description: "Backend process role, queue, and synchronization settings.",
  },
  DEVICE_IP: {
    title: "Device IP Address",
    description: "Network addresses for physical devices installed at the site.",
  },
  ANPR_FTP: {
    title: "ANPR FTP",
    description: "FTP polling settings for ANPR camera capture files.",
  },
  AXLE_FTP: {
    title: "AXLE / VAC FTP",
    description: "FTP polling settings for axle or VAC capture files.",
  },
  MINIO: {
    title: "MinIO Storage",
    description: "Object storage endpoint and bucket settings.",
  },
  CCTV: {
    title: "CCTV Recording",
    description: "CCTV stream, recording, and trigger settings.",
  },
  DIMENSION: {
    title: "Dimension Detection",
    description: "Vehicle dimension processing settings.",
  },
  CALIBRATION: {
    title: "Camera Calibration",
    description: "Camera geometry and reference-object calibration values.",
  },
  WEIGHING: {
    title: "Weighing Trigger",
    description: "External weighing capture trigger settings.",
  },
  VEAM: {
    title: "VEAM License",
    description: "License validation and storage settings.",
  },
};

const pingKeys = new Set(["ANPR_IP", "AXLE_IP", "CCTV_IP", "WIM_IP", "GATEWAY_IP"]);

function groupRows(rows: RuntimeConfigRow[]) {
  return rows.reduce<Record<string, RuntimeConfigRow[]>>((acc, row) => {
    if (!acc[row.config_group]) acc[row.config_group] = [];
    acc[row.config_group].push(row);
    return acc;
  }, {});
}

function displayValue(row: RuntimeConfigRow, values: Record<string, string>) {
  return values[row.config_key] ?? row.config_value ?? "";
}

export function V3ConfigurationDeviceModule() {
  const currentUser = useAppSelector((state) => state.login.user);
  const { data, loading, refetch } = useQuery<{ system_runtime_config: RuntimeConfigRow[] }>(
    GET_RUNTIME_CONFIGS,
    { fetchPolicy: "cache-and-network" }
  );
  const [upsertConfigs, { loading: saving }] = useMutation(UPSERT_RUNTIME_CONFIGS);
  const {
    data: applicationConfigData,
    loading: loadingApplicationConfigs,
    refetch: refetchApplicationConfigs,
  } = useQuery<{ master_config: ApplicationConfigRow[] }>(GET_APPLICATION_CONFIGS, {
    fetchPolicy: "cache-and-network",
  });
  const [updateApplicationConfig, { loading: savingApplicationConfigs }] =
    useMutation(UPDATE_APPLICATION_CONFIG);
  const [values, setValues] = useState<Record<string, string>>({});
  const [applicationValues, setApplicationValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [pingResults, setPingResults] = useState<Record<string, PingResult>>({});
  const [syncStartDate, setSyncStartDate] = useState(todayInputValue);
  const [syncEndDate, setSyncEndDate] = useState(todayInputValue);
  const [syncingDataCenter, setSyncingDataCenter] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<Record<string, number> | null>(null);

  const rows = useMemo(() => data?.system_runtime_config ?? [], [data]);
  const applicationConfigs = useMemo(
    () => applicationConfigData?.master_config ?? [],
    [applicationConfigData],
  );
  const grouped = useMemo(() => groupRows(rows), [rows]);
  const orderedGroups = useMemo(() => Object.keys(grouped), [grouped]);

  useEffect(() => {
    const next: Record<string, string> = {};
    rows.forEach((row) => {
      next[row.config_key] = row.config_value ?? "";
    });
    setValues(next);
    setDirty(false);
  }, [rows]);

  useEffect(() => {
    const next: Record<string, string> = {};
    applicationConfigs.forEach((config) => {
      next[config.id] = config.config_value ?? "";
    });
    setApplicationValues(next);
  }, [applicationConfigs]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const objects = rows.map((row) => ({
        config_group: row.config_group,
        config_key: row.config_key,
        config_value: values[row.config_key] ?? "",
        value_type: row.value_type,
        label: row.label,
        description: row.description,
        is_secret: row.is_secret,
        is_runtime_editable: row.is_runtime_editable,
        sort_order: row.sort_order,
        is_active: true,
        is_deleted: false,
        updated_date: new Date().toISOString(),
      }));

      await upsertConfigs({ variables: { objects } });
      await refetch();
      setDirty(false);
      showToast("Configuration saved. Restart backend services for startup-only values.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save configuration.", "error");
    }
  };

  const applicationDirty = applicationConfigs.some(
    (config) => applicationValues[config.id] !== (config.config_value ?? ""),
  );

  const handleSaveApplicationConfigs = async () => {
    try {
      await Promise.all(
        applicationConfigs
          .filter(
            (config) =>
              applicationValues[config.id] !== (config.config_value ?? ""),
          )
          .map((config) =>
            updateApplicationConfig({
              variables: {
                id: config.id,
                config_value: applicationValues[config.id] ?? "",
                updated_by: currentUser?.id ?? null,
              },
            }),
          ),
      );
      await refetchApplicationConfigs();
      showToast("Application settings saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to save application settings.",
        "error",
      );
    }
  };

  const pingDevice = useCallback(async (key: string, rawValue: string) => {
    const ip = rawValue.trim();
    if (!ip) return;
    setPingResults((prev) => ({ ...prev, [key]: "testing" }));

    const host = ip.startsWith("http") ? ip : `http://${ip}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(host, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
      setPingResults((prev) => ({ ...prev, [key]: "ok" }));
    } catch (error) {
      setPingResults((prev) => ({
        ...prev,
        [key]: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "fail",
      }));
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  const pingAll = () => {
    rows
      .filter((row) => pingKeys.has(row.config_key))
      .forEach((row) => pingDevice(row.config_key, displayValue(row, values)));
  };

  const handleSyncDataCenter = async () => {
    if (!syncStartDate || !syncEndDate) {
      showToast("Pilih start date dan end date terlebih dahulu.", "error");
      return;
    }
    if (syncEndDate < syncStartDate) {
      showToast("End date tidak boleh lebih kecil dari start date.", "error");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const token = getAuthTokenCookie();
    setSyncingDataCenter(true);
    setLastSyncResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/data-center-sync/range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          start_date: syncStartDate,
          end_date: syncEndDate,
          full_sync: true,
        }),
      });
      const payload = (await response.json()) as DataCenterSyncResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to queue data center sync.");
      }
      setLastSyncResult(payload.data?.counts ?? null);
      showToast(
        "Data center full sync queued. Sync agent will upsert local data.",
        "success",
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to queue data center sync.",
        "error",
      );
    } finally {
      setSyncingDataCenter(false);
    }
  };

  const renderInput = (row: RuntimeConfigRow) => {
    const value = displayValue(row, values);
    const disabled = !row.is_runtime_editable;

    if (row.value_type === "boolean") {
      return (
        <select
          value={value || "false"}
          disabled={disabled}
          onChange={(event) => updateValue(row.config_key, event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    const type = row.is_secret && !visibleSecrets[row.config_key] ? "password" : row.value_type === "number" ? "number" : "text";

    return (
      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => updateValue(row.config_key, event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          placeholder={row.config_key}
        />
        {row.is_secret && (
          <button
            type="button"
            onClick={() => setVisibleSecrets((prev) => ({ ...prev, [row.config_key]: !prev[row.config_key] }))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Toggle secret visibility"
          >
            {visibleSecrets[row.config_key] ? <EyeOff24Regular className="h-4 w-4" /> : <Eye24Regular className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-slate-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <ShieldSettings24Regular />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Configuration & Device</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Maintain backend environment, device IP, port, storage, CCTV, and license settings from Hasura.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowClockwise24Regular className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <Save24Regular className="h-4 w-4" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </header>

      {rows.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          No runtime configuration rows were returned. Apply migration
          <span className="font-mono"> 20260616_add_system_runtime_config.sql </span>
          and track <span className="font-mono">system_runtime_config</span> in Hasura.
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Settings24Regular />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Application Settings</h2>
              <p className="text-sm text-slate-500">
                Manage WhatsApp and ODOL tolerance values from the <span className="font-mono">apps</span> configuration table.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveApplicationConfigs}
            disabled={savingApplicationConfigs || !applicationDirty}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save24Regular className="h-4 w-4" />
            {savingApplicationConfigs ? "Saving..." : "Save Application Settings"}
          </button>
        </div>

        {applicationConfigs.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {applicationConfigs.map((config) => (
              <label key={config.id} className="block">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    {config.config_key === "WHATSAPP"
                      ? "WhatsApp"
                      : config.config_key.replaceAll("_", " ")}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                    {config.config_key}
                  </span>
                </div>
                <input
                  type={config.config_key.startsWith("TOLERANCE_") ? "number" : "text"}
                  value={applicationValues[config.id] ?? ""}
                  onChange={(event) =>
                    setApplicationValues((current) => ({
                      ...current,
                      [config.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {config.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {config.description}
                  </p>
                )}
              </label>
            ))}
          </div>
        ) : !loadingApplicationConfigs ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
            No active <span className="font-mono">apps</span> configuration rows were returned.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <NetworkCheck24Regular />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Device Connection Test</h2>
              <p className="text-sm text-slate-500">Browser-based reachability check for configured device IPs.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={pingAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowClockwise24Regular className="h-4 w-4" />
            Test All
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {rows
            .filter((row) => pingKeys.has(row.config_key))
            .map((row) => {
              const result = pingResults[row.config_key] ?? "idle";
              const state = {
                idle: { label: "Not tested", className: "bg-slate-200 text-slate-500" },
                testing: { label: "Testing", className: "bg-blue-100 text-blue-700" },
                ok: { label: "Reachable", className: "bg-green-100 text-green-700" },
                fail: { label: "Failed", className: "bg-red-100 text-red-700" },
                timeout: { label: "Timeout", className: "bg-amber-100 text-amber-700" },
              }[result];

              return (
                <div key={row.config_key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-700">{row.label}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{displayValue(row, values) || "-"}</p>
                  <button
                    type="button"
                    onClick={() => pingDevice(row.config_key, displayValue(row, values))}
                    className={`mt-2 rounded-full px-2 py-1 text-[10px] font-bold ${state.className}`}
                  >
                    {state.label}
                  </button>
                </div>
              );
            })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Server24Regular />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Sync to Data Center
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Queue all local master and transaction data for upsert by the
                running sync agent. The date range is kept for audit context.
              </p>
              {lastSyncResult && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Queued: vehicle {lastSyncResult.vehicle_actual ?? 0}, status{" "}
                  {lastSyncResult.vehicle_status ?? 0}, ANPR{" "}
                  {lastSyncResult.anpr_capture ?? 0}, AXLE{" "}
                  {lastSyncResult.axle_capture ?? 0}, CCTV{" "}
                  {lastSyncResult.cctv ?? 0}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[170px_170px_auto]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Start Date
              </span>
              <input
                type="date"
                value={syncStartDate}
                onChange={(event) => setSyncStartDate(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
                End Date
              </span>
              <input
                type="date"
                value={syncEndDate}
                onChange={(event) => setSyncEndDate(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <button
              type="button"
              onClick={handleSyncDataCenter}
              disabled={syncingDataCenter}
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowClockwise24Regular className="h-4 w-4" />
              {syncingDataCenter ? "Queueing..." : "Sync"}
            </button>
          </div>
        </div>
      </section>

      {orderedGroups.map((group) => {
        const meta = groupLabels[group] ?? { title: group, description: "Runtime configuration values." };
        return (
          <section key={group} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                {group.includes("FTP") || group === "MINIO" ? <Server24Regular /> : <Settings24Regular />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950">{meta.title}</h2>
                <p className="text-sm text-slate-500">{meta.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {grouped[group].map((row) => (
                <label key={row.id} className="block">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{row.label}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                      {row.config_key}
                    </span>
                    {row.is_secret && <Warning24Filled className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  {renderInput(row)}
                  {row.description && <p className="mt-1 text-xs leading-5 text-slate-400">{row.description}</p>}
                </label>
              ))}
            </div>
          </section>
        );
      })}

      {dirty && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-xl">
            <Warning24Filled className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="text-sm font-semibold">Unsaved changes</span>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              <CheckmarkCircle24Filled className="h-4 w-4" />
              Save Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
