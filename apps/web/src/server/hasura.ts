/**
 * Minimal server-side Hasura client for route handlers.
 *
 * Uses HASURA_URL / HASURA_ADMIN_SECRET when set (needed inside Docker, where the
 * browser-facing NEXT_PUBLIC_HASURA_URL points at a host port the container cannot reach)
 * and falls back to the public values used by the browser client.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function env(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

export function getHasuraEndpoint(): string {
  return env("HASURA_URL") || env("NEXT_PUBLIC_HASURA_URL");
}

export function getHasuraAdminSecret(): string {
  return env("HASURA_ADMIN_SECRET") || env("NEXT_PUBLIC_HASURA_SECRET");
}

export async function hasuraRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const endpoint = getHasuraEndpoint();
  if (!endpoint) {
    throw new Error("HASURA_URL / NEXT_PUBLIC_HASURA_URL is not set");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": getHasuraAdminSecret(),
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    const body = (await response.json()) as {
      data?: T;
      errors?: { message: string }[];
    };

    if (body.errors?.length) {
      throw new Error(body.errors.map((error) => error.message).join("; "));
    }
    if (!body.data) {
      throw new Error(`Hasura returned no data (HTTP ${response.status})`);
    }
    return body.data;
  } finally {
    clearTimeout(timer);
  }
}
