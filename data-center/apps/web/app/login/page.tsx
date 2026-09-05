"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.jatanlinkorlantas.id";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Login gagal");
      }

      localStorage.setItem("dc_token", payload.token);
      localStorage.setItem("dc_user", JSON.stringify(payload.user));
      router.push("/data-center");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-6">
      <section className="w-full max-w-[420px] rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
            Jatanlin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Data Center
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masuk untuk melihat ringkasan situs dan transaksi yang tersinkron.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Nama Pengguna
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-blue-600"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Kata Sandi
            </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-blue-600"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-md bg-blue-700 px-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
