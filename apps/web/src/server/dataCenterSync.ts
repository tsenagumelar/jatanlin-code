/**
 * Immediate (on-verification) push of a single record to the Data Center.
 *
 * The sync-agent still mirrors everything on its interval; this only shortens the delay
 * for freshly verified rows. The Data Center upserts on (site_id, source_id), so sending
 * the same row twice is harmless.
 *
 * Server-side only: it reads DATA_CENTER_SYNC_KEY from the environment.
 */

const DEFAULT_TIMEOUT_MS = 20000;

export interface DataCenterSyncConfig {
  enabled: boolean;
  apiUrl: string;
  syncKey: string;
  siteCode: string;
  timeoutMs: number;
}

export interface DataCenterPushResult {
  ok: boolean;
  statusCode: number | null;
  message: string;
}

function env(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

export function getDataCenterSyncConfig(): DataCenterSyncConfig {
  return {
    enabled: env("DATA_CENTER_SYNC_ENABLED", "false").toLowerCase() === "true",
    apiUrl: env("DATA_CENTER_API_URL").replace(/\/+$/, ""),
    syncKey: env("DATA_CENTER_SYNC_KEY"),
    siteCode: env("SITE_CODE") || env("NEXT_PUBLIC_SITE_CODE"),
    timeoutMs: Number(env("DATA_CENTER_SYNC_HTTP_TIMEOUT_SEC")) * 1000 ||
      DEFAULT_TIMEOUT_MS,
  };
}

/**
 * Public URL of an attachment after the sync-agent copied it into the Data Center bucket.
 *
 * The object key is the deterministic layout the agent writes (see targetAttachmentObjectKey
 * in services/backend/cmd/sync-agent/main.go):
 *   {site_code}/{source_table}/{source_id}/{attachment_type}/{file_name}
 *
 * ETLE_PUBLIC_IMAGE_BASE_URL overrides the base when images are published somewhere else.
 * Returns an empty string when the object is unknown or nothing is configured.
 */
export function buildDataCenterAttachmentUrl(params: {
  sourceTable: string;
  sourceId: string;
  attachmentType: string;
  sourceObjectKey: string | null | undefined;
}): string {
  const objectKey = (params.sourceObjectKey || "").trim();
  if (!objectKey || !params.sourceId) return "";

  const siteCode = env("SITE_CODE") || env("NEXT_PUBLIC_SITE_CODE");
  if (!siteCode) return "";

  const fileName = objectKey.split("/").filter(Boolean).pop();
  if (!fileName) return "";

  const path = [
    siteCode,
    params.sourceTable,
    params.sourceId,
    params.attachmentType,
    fileName,
  ].join("/");

  const override = env("ETLE_PUBLIC_IMAGE_BASE_URL").replace(/\/+$/, "");
  if (override) return `${override}/${path}`;

  const endpoint = env("DATA_CENTER_MINIO_ENDPOINT").replace(/\/+$/, "");
  const bucket = env("DATA_CENTER_MINIO_BUCKET");
  if (!endpoint || !bucket) return "";

  const scheme = /^https?:\/\//.test(endpoint)
    ? ""
    : env("DATA_CENTER_MINIO_USE_SSL", "false").toLowerCase() === "true"
      ? "https://"
      : "http://";

  return `${scheme}${endpoint}/${bucket}/${path}`;
}

/**
 * Mirrors rows of one table to the Data Center, mirroring the payload the Go sync-agent
 * sends to POST /api/sync/mirror/batch.
 */
export async function pushMirrorBatch(
  config: DataCenterSyncConfig,
  tableName: string,
  records: Record<string, unknown>[],
): Promise<DataCenterPushResult> {
  if (!config.apiUrl) {
    return { ok: false, statusCode: null, message: "DATA_CENTER_API_URL is not set" };
  }
  if (!config.syncKey) {
    return { ok: false, statusCode: null, message: "DATA_CENTER_SYNC_KEY is not set" };
  }
  if (!config.siteCode) {
    return { ok: false, statusCode: null, message: "SITE_CODE is not set" };
  }
  if (records.length === 0) {
    return { ok: false, statusCode: null, message: "no records to push" };
  }

  const lastSourceUpdatedAt = records.reduce<string | null>((latest, record) => {
    const candidate =
      (record.updated_date as string | null) ||
      (record.created_date as string | null);
    if (!candidate) return latest;
    return !latest || candidate > latest ? candidate : latest;
  }, null);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.apiUrl}/api/sync/mirror/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Site-Sync-Key": config.syncKey,
      },
      body: JSON.stringify({
        site_code: config.siteCode,
        table_name: tableName,
        last_source_updated_at: lastSourceUpdatedAt || new Date().toISOString(),
        records,
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    return {
      ok: response.ok,
      statusCode: response.status,
      message: `${tableName}: HTTP ${response.status}${text ? ` ${text.slice(0, 300)}` : ""}`,
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: null,
      message: `${tableName}: ${(error as Error).message}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
