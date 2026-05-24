"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ShieldCheckmark24Regular,
  ShieldDismiss24Regular,
  Warning24Regular,
  UsbPlug24Regular,
  DocumentArrowUpRegular,
  Copy24Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
  ArrowSync24Regular,
  Info24Regular,
} from "@fluentui/react-icons";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface VeamLicense {
  version: string;
  license_id: string;
  site_id: string;
  issued_to: string;
  issued_by: string;
  issued_date: string;
  expiry_date: string;
  modules: string[];
  max_devices: number;
  hardware_id?: string;
  signature: string;
}

type LicenseStatus = "valid" | "expired" | "invalid_site" | "tampered" | "not_activated";

interface LicenseState {
  status: LicenseStatus;
  license: VeamLicense | null;
  raw: string | null;
  loadedAt: string | null;
}

// ─────────────────────────────────────────────
// Crypto constants
// ─────────────────────────────────────────────

// ⚠️  AES-256-GCM key — harus identik dengan generate-veam-key.js
// File .veam TIDAK BISA dibaca tanpa key ini.
const VEAM_AES_KEY_HEX = "e75358d72bf90c6f8c30b96fe3832f4b137be9c18c91db7e438e2b7a0cdd44ac";

// HMAC key untuk validasi signature isi lisensi
const VEAM_HMAC_KEY = "VEAM-ACTIVA-2025-HMAC-S3CR3T-K3Y";

const LS_KEY = "veam_license_v2";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function computeSignature(lic: Omit<VeamLicense, "signature">): Promise<string> {
  const payload = [
    lic.license_id, lic.site_id, lic.issued_to,
    lic.issued_date, lic.expiry_date,
    lic.modules.join(","), String(lic.max_devices),
    VEAM_HMAC_KEY,
  ].join("|");
  return sha256Hex(payload);
}

/**
 * Dekripsi file .veam menggunakan AES-256-GCM.
 * Format: hex(IV 12-byte) + hex(ciphertext) + hex(authTag 16-byte)
 * = 24 hex chars IV + N hex chars CT + 32 hex chars tag
 */
async function decryptVeamFile(hexStr: string): Promise<string> {
  const clean = hexStr.trim();

  // Minimum length: 24 (IV) + 2 (1 byte CT) + 32 (tag) = 58 hex chars
  if (clean.length < 58 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Format file tidak valid — bukan file .veam terenkripsi");
  }

  const ivBytes      = hexToBytes(clean.slice(0, 24));           // 12 bytes
  const authTagBytes = hexToBytes(clean.slice(-32));             // 16 bytes
  const ctBytes      = hexToBytes(clean.slice(24, clean.length - 32));

  // Gabung ciphertext + authTag (Web Crypto API: tag di akhir ciphertext)
  const ctWithTag = new Uint8Array(ctBytes.length + authTagBytes.length);
  ctWithTag.set(ctBytes, 0);
  ctWithTag.set(authTagBytes, ctBytes.length);

  // Import key
  const keyBytes = hexToBytes(VEAM_AES_KEY_HEX);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer as ArrayBuffer, tagLength: 128 },
    cryptoKey,
    ctWithTag.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

async function validateLicense(raw: string): Promise<LicenseState> {
  let parsed: VeamLicense;
  const configuredSiteId = process.env.NEXT_PUBLIC_SITE_ID ?? "";
  const loadedAt = new Date().toISOString();

  // 1. Dekripsi AES-256-GCM
  let jsonStr: string;
  try {
    jsonStr = await decryptVeamFile(raw);
  } catch {
    // Fallback: coba parse langsung sebagai JSON (untuk testing/migration)
    try {
      JSON.parse(raw.trim());
      jsonStr = raw.trim();
    } catch {
      return { status: "tampered", license: null, raw, loadedAt };
    }
  }

  // 2. Parse JSON
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { status: "tampered", license: null, raw, loadedAt };
  }

  // 3. Required fields check
  const required: (keyof VeamLicense)[] = [
    "license_id", "site_id", "issued_to", "issued_by",
    "issued_date", "expiry_date", "modules", "max_devices", "signature",
  ];
  for (const f of required) {
    if (!(f in parsed)) {
      return { status: "tampered", license: parsed, raw, loadedAt };
    }
  }

  // 4. Signature check
  const { signature, ...rest } = parsed;
  const expectedSig = await computeSignature(rest as Omit<VeamLicense, "signature">);
  if (signature !== expectedSig) {
    return { status: "tampered", license: parsed, raw, loadedAt };
  }

  // 5. Site ID check
  if (configuredSiteId && parsed.site_id !== configuredSiteId) {
    return { status: "invalid_site", license: parsed, raw, loadedAt };
  }

  // 6. Expiry check
  const now = new Date();
  const expiry = new Date(parsed.expiry_date + "T23:59:59");
  if (now > expiry) {
    return { status: "expired", license: parsed, raw, loadedAt };
  }

  return { status: "valid", license: parsed, raw, loadedAt };
}

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const exp = new Date(expiryDate + "T23:59:59");
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const StatusBadge: React.FC<{ status: LicenseStatus }> = ({ status }) => {
  const configs = {
    valid:          { icon: <CheckmarkCircle24Filled />, label: "AKTIF",           cls: "bg-green-50 border-green-200 text-green-700" },
    expired:        { icon: <DismissCircle24Filled />,   label: "KADALUARSA",      cls: "bg-red-50 border-red-200 text-red-700" },
    invalid_site:   { icon: <Warning24Filled />,          label: "SITE TIDAK COCOK", cls: "bg-amber-50 border-amber-200 text-amber-700" },
    tampered:       { icon: <DismissCircle24Filled />,   label: "FILE RUSAK/PALSU", cls: "bg-red-50 border-red-200 text-red-700" },
    not_activated:  { icon: <ShieldDismiss24Regular />,  label: "BELUM AKTIF",     cls: "bg-slate-50 border-slate-200 text-slate-500" },
  };
  const cfg = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <span className="w-4 h-4">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export const V2VeamLicenseModule: React.FC = () => {
  const [licState, setLicState] = useState<LicenseState>({
    status: "not_activated",
    license: null,
    raw: null,
    loadedAt: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        const saved = JSON.parse(stored) as LicenseState;
        // Re-validate signature asynchronously
        if (saved.raw) {
          validateLicense(saved.raw).then((result) => {
            setLicState(result);
            localStorage.setItem(LS_KEY, JSON.stringify(result));
          });
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".veam") && !file.name.endsWith(".json")) {
      showToast("Format file tidak valid. Gunakan file .veam atau .json", "error");
      return;
    }
    setIsLoading(true);
    try {
      const raw = await file.text();
      const result = await validateLicense(raw);
      setLicState(result);
      localStorage.setItem(LS_KEY, JSON.stringify(result));

      const msgs: Record<LicenseStatus, string> = {
        valid:         "✓ Lisensi valid — VEAM berhasil diaktifkan",
        expired:       "Lisensi sudah kadaluarsa. Hubungi Activa Digital untuk perpanjangan.",
        invalid_site:  "Site ID tidak cocok dengan konfigurasi sistem.",
        tampered:      "File lisensi tidak valid atau telah dimodifikasi.",
        not_activated: "File tidak dapat diproses.",
      };
      showToast(msgs[result.status], result.status === "valid" ? "success" : "error");
    } catch (e) {
      showToast("Gagal membaca file lisensi.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleScanUsb = async () => {
    setScanning(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/veam/scan-license`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.content) {
        const result = await validateLicense(data.content);
        setLicState(result);
        localStorage.setItem(LS_KEY, JSON.stringify(result));
        showToast(
          result.status === "valid"
            ? `✓ Lisensi ditemukan di USB: ${data.path}`
            : "File lisensi ditemukan tapi tidak valid.",
          result.status === "valid" ? "success" : "error"
        );
      } else {
        showToast("Tidak ada file .veam ditemukan di USB drive.", "info");
      }
    } catch {
      showToast("Backend API tidak tersedia. Gunakan upload manual.", "info");
    } finally {
      setScanning(false);
    }
  };

  const handleRevoke = () => {
    const confirm = window.confirm("Hapus lisensi yang tersimpan? VEAM akan menjadi tidak aktif.");
    if (confirm) {
      localStorage.removeItem(LS_KEY);
      setLicState({ status: "not_activated", license: null, raw: null, loadedAt: null });
      showToast("Lisensi telah dihapus.", "info");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Disalin ke clipboard", "info");
  };

  const { status, license, loadedAt } = licState;
  const daysLeft = license ? daysUntilExpiry(license.expiry_date) : 0;
  const configuredSiteId = process.env.NEXT_PUBLIC_SITE_ID ?? "(tidak dikonfigurasi)";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all
          ${toast.type === "success" ? "bg-green-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-700 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheckmark24Regular />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">VEAM License</h1>
              <p className="text-xs text-slate-500">Vehicle Enforcement Activation Module</p>
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* ── Active License Card ── */}
      {license && status !== "not_activated" && (
        <div className={`rounded-2xl border-2 p-5 space-y-4
          ${status === "valid" ? "border-green-200 bg-green-50/50" : status === "expired" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}`}>

          {/* Expiry banner */}
          {status === "valid" && daysLeft <= 30 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
              <Warning24Regular className="w-4 h-4 shrink-0" />
              Lisensi akan kadaluarsa dalam <strong>{daysLeft} hari</strong>. Segera perbarui.
            </div>
          )}
          {status === "expired" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
              <DismissCircle24Filled className="w-4 h-4 shrink-0" />
              Lisensi kadaluarsa pada {formatDate(license.expiry_date)}. VEAM tidak aktif.
            </div>
          )}
          {status === "invalid_site" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
              <Warning24Filled className="w-4 h-4 shrink-0" />
              Site ID tidak cocok. Lisensi ini untuk site lain.
            </div>
          )}

          {/* License detail grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <DetailRow label="License ID" value={license.license_id} onCopy={handleCopy} />
            <DetailRow label="Diterbitkan untuk" value={license.issued_to} />
            <DetailRow label="Diterbitkan oleh" value={license.issued_by} />
            <DetailRow label="Tanggal Terbit" value={formatDate(license.issued_date)} />
            <DetailRow label="Tanggal Kadaluarsa"
              value={`${formatDate(license.expiry_date)} ${status === "valid" ? `(${daysLeft} hari lagi)` : ""}`}
              highlight={status === "expired" ? "red" : daysLeft <= 30 ? "amber" : "none"}
            />
            <DetailRow label="Max Perangkat" value={`${license.max_devices} unit`} />
            <DetailRow label="Site ID" value={license.site_id} onCopy={handleCopy} mono />
            <DetailRow label="Modul Aktif" value={license.modules.join(", ")} />
            {license.hardware_id && (
              <DetailRow label="Hardware ID" value={license.hardware_id} mono />
            )}
            <DetailRow label="Dimuat pada" value={loadedAt ? new Date(loadedAt).toLocaleString("id-ID") : "-"} />
          </div>

          {/* Signature */}
          <div className="mt-2 pt-3 border-t border-slate-200/60">
            <p className="text-[10px] text-slate-400 font-mono break-all">
              <span className="font-bold text-slate-500">SIG: </span>{license.signature.substring(0, 48)}…
            </p>
          </div>

          {/* Revoke */}
          <div className="flex justify-end">
            <button
              onClick={handleRevoke}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Hapus Lisensi
            </button>
          </div>
        </div>
      )}

      {/* ── Upload zone (shown when not activated OR to re-upload) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            {status === "not_activated" ? "Muat File Lisensi" : "Perbarui Lisensi"}
          </h2>
        </div>

        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".veam,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <ArrowSync24Regular className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Memvalidasi lisensi…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <DocumentArrowUpRegular className="w-10 h-10" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Klik atau seret file lisensi ke sini</p>
                <p className="text-xs mt-1">Format yang didukung: <code className="bg-slate-200 px-1 rounded">.veam</code> atau <code className="bg-slate-200 px-1 rounded">.json</code></p>
              </div>
            </div>
          )}
        </div>

        {/* USB Scan button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 font-medium">atau</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <button
          onClick={handleScanUsb}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white
            text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30
            transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <ArrowSync24Regular className="w-5 h-5 animate-spin" />
          ) : (
            <UsbPlug24Regular className="w-5 h-5" />
          )}
          {scanning ? "Memindai USB Drive…" : "Scan Otomatis USB Drive"}
        </button>
      </div>

      {/* ── Info Panel ── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
          <Info24Regular className="w-4 h-4" />
          Informasi Sistem
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">Site ID Sistem</span>
            <span className="font-mono text-xs truncate max-w-[200px]" title={configuredSiteId}>{configuredSiteId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Versi VEAM</span>
            <span className="font-semibold">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">API Backend</span>
            <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status License</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* ── How to use ── */}
      {status === "not_activated" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Cara Menggunakan Lisensi VEAM</p>
          <ol className="text-sm text-slate-600 space-y-2 list-none">
            {[
              "Hubungi Activa Digital untuk mendapatkan file lisensi (.veam) yang sudah dikonfigurasi untuk site Anda.",
              "Salin file .veam ke USB flashdisk yang akan dijadikan dongle lisensi.",
              "Tancapkan USB flashdisk ke laptop/komputer yang menjalankan sistem JATANLIN.",
              "Klik tombol \"Scan Otomatis USB Drive\" atau upload file .veam secara manual.",
              "Setelah lisensi valid, modul VEAM akan aktif dan perangkat lapangan dapat terhubung.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// DetailRow helper
// ─────────────────────────────────────────────
const DetailRow: React.FC<{
  label: string;
  value: string;
  onCopy?: (v: string) => void;
  mono?: boolean;
  highlight?: "red" | "amber" | "none";
}> = ({ label, value, onCopy, mono, highlight = "none" }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={`text-sm font-medium break-all
        ${mono ? "font-mono text-xs" : ""}
        ${highlight === "red" ? "text-red-600" : highlight === "amber" ? "text-amber-600" : "text-slate-800"}
      `}>
        {value}
      </span>
      {onCopy && (
        <button
          onClick={() => onCopy(value)}
          className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
        >
          <Copy24Regular className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);
