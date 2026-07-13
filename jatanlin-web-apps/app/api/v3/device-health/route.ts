import net from "node:net";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProbeProtocol = "http" | "tcp";

function parseTarget(target: string) {
  const normalized = target.includes("://") ? target : `tcp://${target}`;
  const url = new URL(normalized);
  const port = url.port
    ? Number(url.port)
    : url.protocol === "https:"
      ? 443
      : url.protocol === "http:"
        ? 80
        : 0;

  return {
    host: url.hostname,
    port,
    href: url.href,
  };
}

function tcpProbe(host: string, port: number, timeoutMs: number) {
  return new Promise<{ ok: boolean; message: string; latencyMs: number }>((resolve) => {
    const startedAt = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const settle = (ok: boolean, message: string) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({
        ok,
        message,
        latencyMs: Date.now() - startedAt,
      });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => settle(true, "TCP connection established"));
    socket.once("timeout", () => settle(false, "TCP probe timeout"));
    socket.once("error", (error) => settle(false, error.message));
    socket.connect(port, host);
  });
}

async function httpProbe(target: string, timeoutMs: number) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(target, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      message: `HTTP ${response.status}`,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof DOMException && error.name === "AbortError"
          ? "HTTP probe timeout"
          : error instanceof Error
            ? error.message
            : "HTTP probe failed",
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target")?.trim();
  const protocol = (searchParams.get("protocol") || "tcp") as ProbeProtocol;
  const timeoutMs = Number(searchParams.get("timeoutMs") || 3000);

  if (!target) {
    return NextResponse.json(
      { ok: false, message: "target is required", latencyMs: 0 },
      { status: 400 },
    );
  }

  try {
    const parsed = parseTarget(target);
    if (!parsed.host || !parsed.port) {
      return NextResponse.json(
        { ok: false, message: "target host or port is invalid", latencyMs: 0 },
        { status: 400 },
      );
    }

    const result =
      protocol === "http"
        ? await httpProbe(target.includes("://") ? target : `http://${target}`, timeoutMs)
        : await tcpProbe(parsed.host, parsed.port, timeoutMs);

    return NextResponse.json({
      ...result,
      protocol,
      target,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "probe failed",
        latencyMs: 0,
        protocol,
        target,
        checkedAt: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
}
