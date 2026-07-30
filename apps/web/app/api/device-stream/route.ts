import http from "node:http";
import https from "node:https";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const defaultStreams: Record<string, string> = {
  anpr: "http://10.0.43.30:9901/video.mjpeg",
  axle: "http://10.0.43.40:9901/video.mjpeg",
  cctv: "rtsp://10.0.43.20:554/profile1",
};

function resolveTarget(request: Request) {
  const { searchParams } = new URL(request.url);
  const device = (searchParams.get("device") || "").toLowerCase();
  const rawTarget = searchParams.get("target") || defaultStreams[device] || "";

  if (!rawTarget) return null;
  if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
    return rawTarget;
  }
  if (rawTarget.startsWith("rtsp://")) {
    return rawTarget;
  }
  return `http://${rawTarget}`;
}

function mjpegContentType(raw?: string | string[]) {
  const contentType = Array.isArray(raw) ? raw[0] : raw;
  const boundary = contentType?.match(/boundary=([^;]+)/i)?.[1];

  return boundary
    ? `multipart/x-mixed-replace; boundary=${boundary}`
    : "multipart/x-mixed-replace";
}

function streamHeaders(contentType = "multipart/x-mixed-replace") {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");
  return headers;
}

function transcodeRTSP(target: string) {
  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-rtsp_transport",
    "tcp",
    "-i",
    target,
    "-an",
    "-vf",
    "fps=8",
    "-q:v",
    "6",
    "-f",
    "mpjpeg",
    "pipe:1",
  ]);

  const body = new ReadableStream({
    start(controller) {
      ffmpeg.stdout.on("data", (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      ffmpeg.stdout.on("end", () => {
        controller.close();
      });
      ffmpeg.on("error", (error) => {
        controller.error(error);
      });
      ffmpeg.on("close", () => {
        try {
          controller.close();
        } catch {
          // Stream may already be closed by stdout end.
        }
      });
    },
    cancel() {
      ffmpeg.kill("SIGTERM");
    },
  });

  return new Response(body, {
    status: 200,
    headers: streamHeaders("multipart/x-mixed-replace; boundary=ffmpeg"),
  });
}

function proxyStream(target: string) {
  return new Promise<Response>((resolve) => {
    let settled = false;
    const url = new URL(target);
    const transport = url.protocol === "https:" ? https : http;

    const finish = (response: Response) => {
      if (settled) return;
      settled = true;
      resolve(response);
    };

    const req = transport.request(
      url,
      {
        method: "GET",
        headers: {
          Accept: "multipart/x-mixed-replace,image/jpeg,*/*",
          "User-Agent": "Jatanlin-Device-Stream/1.0",
          Connection: "keep-alive",
        },
      },
      (upstream) => {
        const contentType = mjpegContentType(upstream.headers["content-type"]);

        if ((upstream.statusCode || 0) >= 400) {
          upstream.resume();
          finish(
            NextResponse.json(
              {
                ok: false,
                message: `stream upstream returned HTTP ${upstream.statusCode}`,
                target,
              },
              { status: 502 },
            ),
          );
          return;
        }

        finish(
          new Response(Readable.toWeb(upstream) as ReadableStream, {
            status: 200,
            headers: streamHeaders(contentType),
          }),
        );
      },
    );

    req.setTimeout(5000, () => {
      req.destroy(new Error("stream upstream timeout"));
    });

    req.on("error", (error) => {
      finish(
        NextResponse.json(
          {
            ok: false,
            message: error.message,
            target,
          },
          { status: 502 },
        ),
      );
    });

    req.end();
  });
}

export async function GET(request: Request) {
  const target = resolveTarget(request);

  if (!target) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "A browser-playable HTTP MJPEG stream target is required.",
      },
      { status: 400 },
    );
  }

  if (target.startsWith("rtsp://")) {
    return transcodeRTSP(target);
  }

  return proxyStream(target);
}
