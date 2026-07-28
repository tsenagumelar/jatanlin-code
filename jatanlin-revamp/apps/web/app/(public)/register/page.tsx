import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Daftar
        </p>
        <h1 className="mt-3 text-2xl font-bold">Registrasi Akun</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Halaman registrasi v3 sudah siap. Form registrasi akan
          diimplementasikan setelah alur registrasi difinalisasi.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
        >
          Kembali ke Login
        </Link>
      </section>
    </main>
  );
}
