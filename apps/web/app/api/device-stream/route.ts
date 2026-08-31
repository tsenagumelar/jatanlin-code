import http from "node:http";
import https from "node:https";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const defaultStreams: Record<string, string> = {
  anpr: "http://10.0.43.30:9901/video.mjpeg",
  axle: "http://10.0.43.40:9901/video.mjpeg",
  cctv: "rtsp://10.0.43.20:554/profile1",
};

function withCctvCredentials(target: string, device: string) {
  if (device !== "cctv" || !target.startsWith("rtsp://")) return target;

  const username = process.env.CCTV_STREAM_USERNAME;
  const password = process.env.CCTV_STREAM_PASSWORD;
  if (!username || !password) return target;

  try {
    const url = new URL(target);
    if (url.username) return target;
    url.username = username;
    url.password = password;
    return url.toString();
  } catch {
    return target;
  }
}

function resolveTarget(request: Request) {
  const { searchParams } = new URL(request.url);
  const device = (searchParams.get("device") || "").toLowerCase();
  const rawTarget = searchParams.get("target") || defaultStreams[device] || "";

  if (!rawTarget) return null;
  const target =
    rawTarget.startsWith("http://") ||
    rawTarget.startsWith("https://") ||
    rawTarget.startsWith("rtsp://")
      ? rawTarget
      : `http://${rawTarget}`;

  return withCctvCredentials(target, device);
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
  const ffmpegPath =
    process.env.FFMPEG_PATH ||
    path.join(
      process.cwd(),
      "node_modules",
      "ffmpeg-static",
      process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
    );

  if (!existsSync(ffmpegPath)) {
    return NextResponse.json(
      {
        ok: false,
        message: "FFmpeg lokal tidak tersedia untuk mengubah stream RTSP.",
      },
      { status: 503 },
    );
  }

  const ffmpeg = spawn(ffmpegPath, [
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

  let closed = false;
  const body = new ReadableStream({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // The client may have cancelled the response first.
        }
      };
      const fail = (error: Error) => {
        if (closed) return;
        closed = true;
        try {
          controller.error(error);
        } catch {
          // The client may have cancelled the response first.
        }
      };

      ffmpeg.stdout.on("data", (chunk) => {
        if (closed) return;
        controller.enqueue(new Uint8Array(chunk));
      });
      ffmpeg.stdout.on("end", () => {
        close();
      });
      ffmpeg.on("error", (error) => {
        fail(error);
      });
      ffmpeg.on("close", () => {
        close();
      });
    },
    cancel() {
      closed = true;
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
