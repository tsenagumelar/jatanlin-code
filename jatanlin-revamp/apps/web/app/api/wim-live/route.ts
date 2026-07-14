export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_WIM_STREAM_URL = "http://127.0.0.1:5000/ws/wim/live";

function sseHeaders() {
  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");
  return headers;
}

function sseStatus(payload: Record<string, unknown>) {
  return new Response(`event: status\ndata: ${JSON.stringify(payload)}\n\n`, {
    status: 200,
    headers: sseHeaders(),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target =
    searchParams.get("target")?.trim() ||
    process.env.WIM_AGENT_STREAM_URL ||
    DEFAULT_WIM_STREAM_URL;

  try {
    const response = await fetch(target, {
      cache: "no-store",
      headers: {
        Accept: "text/event-stream",
      },
      signal: request.signal,
    });

    if (!response.ok || !response.body) {
      return sseStatus({
        type: "status",
        connected: false,
        connectionState: "Stream upstream unavailable",
        error: `WIM stream upstream returned HTTP ${response.status}`,
        updatedAt: new Date().toISOString(),
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: sseHeaders(),
    });
  } catch (error) {
    return sseStatus({
      type: "status",
      connected: false,
      connectionState: "Stream upstream unavailable",
      error: error instanceof Error ? error.message : "Cannot connect to WIM stream upstream",
      updatedAt: new Date().toISOString(),
    });
  }
}
