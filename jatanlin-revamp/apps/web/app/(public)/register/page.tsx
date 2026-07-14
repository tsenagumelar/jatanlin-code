import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Register
        </p>
        <h1 className="mt-3 text-2xl font-bold">Account Registration</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The v3 registration page is ready. The registration form will be
          implemented after the registration flow is finalized.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
        >
          Back to Login
        </Link>
      </section>
    </main>
  );
}
