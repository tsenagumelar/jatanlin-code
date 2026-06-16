"use client";

import Image from "next/image";
import Link from "next/link";
import { useV3Login } from "./hooks";

export function V3LoginPage() {
  const { formData, isLoading, error, handleChange, handleSubmit } =
    useV3Login();

  return (
    <main className="v3-ui min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[url('/bg.jpeg')] bg-cover bg-center lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 p-12 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-lg">
                <Image
                  src="/polantas.png"
                  alt="Traffic Corps Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  TRAFFIC CORPS
                </h1>
                <p className="text-xl font-bold text-neutral-100">
                  Law Enforcement Directorate - Accident Sub Directorate
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 px-12 pb-28 text-white">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold leading-tight">JATANLIN</h2>
              <p className="mt-4 max-w-xl text-lg font-semibold text-blue-100">
                A fast, accurate, and transparent platform for enforcing over
                dimension and over loading traffic violations.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center overflow-hidden bg-white px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Image
                  src="/polantas.png"
                  alt="Traffic Corps Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-bold tracking-[0.2em] text-blue-700">
                  JATANLIN
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Traffic Corps
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <Image
                src="/polantas.png"
                alt=""
                width={600}
                height={600}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.045]"
              />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Login
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                  Sign in to Jatanlin
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use your registered operator or admin account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="relative z-10 mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Email or username
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="operator@jatanlin.local"
                    disabled={isLoading}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <Link
                      href="/v3/reset-password"
                      className="text-xs font-bold text-blue-700 hover:text-blue-800"
                    >
                      Reset password
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading ? "Processing..." : "Sign In"}
                </button>
              </form>

              <div className="relative z-10 mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-sm">
                <span className="text-slate-500">Do not have an account?</span>
                <Link
                  href="/v3/register"
                  className="font-bold text-blue-700 hover:text-blue-800"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
