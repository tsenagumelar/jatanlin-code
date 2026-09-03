/**
 * ETLE (api-etle.polri.go.id) integration client.
 *
 * Server-side only: it reads ETLE_* credentials from the environment, so it must never
 * be imported from a client component. See docs/etle.md for the API contract.
 *
 * Scope note: this only sends the violation to ETLE and records the response. Pushing the
 * verification to the Data Center is NOT triggered from here - that already runs as a
 * background service (services/backend/cmd/sync-agent) on its own interval.
 */

const DEFAULT_BASE_URL = "https://api-etle.polri.go.id";
const DEFAULT_TIMEOUT_MS = 20000;
/** Fallback lifetime when the access token carries no readable exp claim. */
const FALLBACK_TOKEN_TTL_MS = 30 * 60 * 1000;
/** Refresh a little early so a token never expires mid-request. */
const TOKEN_EXPIRY_SKEW_MS = 60 * 1000;

export interface EtleConfig {
  enabled: boolean;
  baseUrl: string;
  userToken: string;
  passToken: string;
  clientSecret: string;
  clientId: string;
  timeoutMs: number;
  violationCode: string;
  violationName: string;
  deviceName: string;
  cameraType: string;
  locationName: string;
  locationDescription: string;
  lat: string;
  lon: string;
  nrp: string;
  satwil: string;
  province: string;
  court: string;
  prosecutor: string;
}

export interface EtleViolationInput {
  plate: string;
  plateColor?: string;
  plateImageUrl?: string;
  vehicleType?: string;
  vehicleColor?: string;
  vehicleImageUrl?: string;
  videoUrl?: string;
  /** Epoch milliseconds of the capture. */
  captureTime: number;
  violationCode?: string;
  violationName?: string;
}

export interface EtleSendResult {
  ok: boolean;
  /** Status from the ETLE response body when numeric, otherwise the HTTP status. */
  statusCode: number | null;
  message: string;
  payload: Record<string, unknown>;
}

function env(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

export function getEtleConfig(): EtleConfig {
  return {
    enabled: env("ETLE_ENABLED", "false").toLowerCase() === "true",
    baseUrl: env("ETLE_BASE_URL", DEFAULT_BASE_URL).replace(/\/+$/, ""),
    userToken: env("ETLE_USER_TOKEN"),
    passToken: env("ETLE_PASS_TOKEN"),
    clientSecret: env("ETLE_CLIENT_SECRET"),
    clientId: env("ETLE_CLIENT_ID", "integrasi"),
    timeoutMs: Number(env("ETLE_TIMEOUT_MS")) || DEFAULT_TIMEOUT_MS,
    violationCode: env("ETLE_VIOLATION_CODE", "TM"),
    violationName: env("ETLE_VIOLATION_NAME", "Melanggar Tata Cara Muatan"),
    deviceName: env("ETLE_DEVICE_NAME"),
    cameraType: env("ETLE_CAMERA_TYPE", "ANPR Camera"),
    locationName: env("ETLE_LOCATION_NAME"),
    locationDescription: env("ETLE_LOCATION_DESCRIPTION"),
    lat: env("ETLE_LAT"),
    lon: env("ETLE_LON"),
    nrp: env("ETLE_NRP"),
    satwil: env("ETLE_SATWIL"),
    province: env("ETLE_PROVINCE"),
    court: env("ETLE_COURT"),
    prosecutor: env("ETLE_PROSECUTOR"),
  };
}

export function assertEtleConfigured(config: EtleConfig): string | null {
  if (!config.userToken) return "ETLE_USER_TOKEN is not set";
  if (!config.passToken) return "ETLE_PASS_TOKEN is not set";
  if (!config.clientSecret) return "ETLE_CLIENT_SECRET is not set";
  if (!config.deviceName) return "ETLE_DEVICE_NAME is not set";
  if (!config.satwil) return "ETLE_SATWIL is not set";
  return null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Reads the exp claim of a JWT without verifying it, purely to schedule the next login. */
function jwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ status: number; body: unknown; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    return { status: response.status, body, text };
  } finally {
    clearTimeout(timer);
  }
}

export async function getEtleAccessToken(
  config: EtleConfig,
  forceRefresh = false,
): Promise<string> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const { status, body, text } = await fetchJson(
    `${config.baseUrl}/user/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usertoken: config.userToken,
        passtoken: config.passToken,
        client_secret: config.clientSecret,
        client_id: config.clientId,
      }),
    },
    config.timeoutMs,
  );

  const token = (body as { access_token?: string } | null)?.access_token;
  if (status !== 200 || !token) {
    throw new Error(
      `ETLE login failed (HTTP ${status}): ${text.slice(0, 300) || "empty response"}`,
    );
  }

  const expiresAt =
    (jwtExpiryMs(token) ?? Date.now() + FALLBACK_TOKEN_TTL_MS) -
    TOKEN_EXPIRY_SKEW_MS;
  cachedToken = { token, expiresAt };
  return token;
}

export function buildEtleViolationPayload(
  config: EtleConfig,
  input: EtleViolationInput,
): Record<string, unknown> {
  return {
    deviceName: config.deviceName,
    locationName: config.locationName,
    locationDescription: config.locationDescription,
    lat: config.lat,
    lon: config.lon,
    NRP: config.nrp,
    satwil: config.satwil,
    plate: input.plate,
    plateColor: input.plateColor || "Unknown",
    plateImageUrl: input.plateImageUrl || "-",
    vehicleType: input.vehicleType || "-",
    vehicleColor: input.vehicleColor || "-",
    vehicleImageUrl: input.vehicleImageUrl || "-",
    videoUrl: input.videoUrl || "not available",
    violationCode: input.violationCode || config.violationCode,
    violationName: input.violationName || config.violationName,
    captureTime: input.captureTime,
  };
}

/**
 * Posts one violation to ETLE. Retries once with a fresh token when the cached one
 * is rejected, since the token lifetime is decided by ETLE and not by us.
 */
export async function sendEtleViolation(
  config: EtleConfig,
  input: EtleViolationInput,
): Promise<EtleSendResult> {
  const payload = buildEtleViolationPayload(config, input);
  const url = `${config.baseUrl}/violation/insert`;

  const post = async (token: string) =>
    fetchJson(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ datas: [payload] }),
      },
      config.timeoutMs,
    );

  let token = await getEtleAccessToken(config);
  let response = await post(token);

  if (response.status === 401 || response.status === 403) {
    token = await getEtleAccessToken(config, true);
    response = await post(token);
  }

  const bodyStatus = (response.body as { status?: unknown } | null)?.status;
  const statusCode =
    typeof bodyStatus === "number" ? bodyStatus : response.status;

  return {
    ok: response.status >= 200 && response.status < 300,
    statusCode,
    message:
      `HTTP ${response.status}` +
      (response.text ? ` ${response.text.slice(0, 500)}` : ""),
    payload,
  };
}

/**
 * Public URL of an attachment once the background sync-agent has copied it into the
 * Data Center's MinIO bucket. The object key is the deterministic layout the agent writes
 * (see targetAttachmentObjectKey in services/backend/cmd/sync-agent/main.go):
 *   {site_code}/{source_table}/{source_id}/{attachment_type}/{file_name}
 *
 * ETLE_PUBLIC_IMAGE_BASE_URL overrides the base when images are published somewhere else.
 * Returns an empty string when the object is unknown or nothing is configured - the caller
 * should fall back to "-" in that case, same as any other missing ETLE field.
 *
 * Note: this only builds the URL: it does not push or wait for the attachment to sync.
 * If verification happens before the background sync-agent has copied the image, the URL
 * will 404 until the agent's next cycle catches up.
 */
export function buildAttachmentImageUrl(params: {
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
