"use client";

import React, { useState } from "react";
import {
  Add24Regular,
  Delete24Regular,
  CheckmarkCircle24Filled,
  Circle24Regular,
  Scales24Regular,
  Camera24Regular,
  Ruler24Regular,
  Edit24Regular,
  Info24Regular,
} from "@fluentui/react-icons";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type DeviceType = "PWS" | "TIIC" | "DMC";

interface RegisteredDevice {
  id: string;
  type: DeviceType;
  name: string;
  serial: string;
  ip: string;
  port: string;
  location: string;
  registered_at: string;
  is_active: boolean;
}

const DEVICE_META: Record<DeviceType, { label: string; desc: string; icon: React.ReactElement; color: string }> = {
  PWS:  { label: "Portable Weighing System",          desc: "Timbangan portabel axle & gross weight",  icon: <Scales24Regular />, color: "blue" },
  TIIC: { label: "Traffic Intelligence Identifier Camera", desc: "Kamera identifikasi plat nomor & kelas",  icon: <Camera24Regular />, color: "violet" },
  DMC:  { label: "Dimension Measuring Camera",        desc: "Kamera pengukur dimensi kendaraan",        icon: <Ruler24Regular />,  color: "emerald" },
};

const EMPTY_FORM: Omit<RegisteredDevice, "id" | "registered_at" | "is_active"> = {
  type: "PWS",
  name: "",
  serial: "",
  ip: "",
  port: "4001",
  location: "",
};

// ─────────────────────────────────────────────
// Seed data (localStorage-backed)
// ─────────────────────────────────────────────
const LS_KEY = "veam_devices_v1";

function loadDevices(): RegisteredDevice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDevices(devs: RegisteredDevice[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(devs));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const V2VeamDeviceRegistrationModule: React.FC = () => {
  const [devices, setDevices] = useState<RegisteredDevice[]>(loadDevices);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.serial || !form.ip) {
      showMsg("Nama, serial, dan IP wajib diisi.");
      return;
    }

    let updated: RegisteredDevice[];
    if (editId) {
      updated = devices.map((d) =>
        d.id === editId ? { ...d, ...form } : d
      );
      showMsg("✓ Data perangkat diperbarui.");
    } else {
      const newDev: RegisteredDevice = {
        id: uid(),
        ...form,
        registered_at: new Date().toISOString(),
        is_active: false,
      };
      updated = [...devices, newDev];
      showMsg("✓ Perangkat berhasil didaftarkan.");
    }

    saveDevices(updated);
    setDevices(updated);
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleEdit = (dev: RegisteredDevice) => {
    setForm({ type: dev.type, name: dev.name, serial: dev.serial, ip: dev.ip, port: dev.port, location: dev.location });
    setEditId(dev.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Hapus perangkat ini?")) return;
    const updated = devices.filter((d) => d.id !== id);
    saveDevices(updated);
    setDevices(updated);
    showMsg("Perangkat dihapus.");
  };

  const handleToggle = (id: string) => {
    const updated = devices.map((d) =>
      d.id === id ? { ...d, is_active: !d.is_active } : d
    );
    saveDevices(updated);
    setDevices(updated);
  };

  const grouped = (["PWS", "TIIC", "DMC"] as DeviceType[]).map((type) => ({
    type,
    items: devices.filter((d) => d.type === type),
  }));

  const colorCls: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg bg-slate-800 text-white text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Device Registration</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola perangkat lapangan yang terhubung ke VEAM</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Add24Regular className="w-4 h-4" />
          Daftarkan Perangkat
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {grouped.map(({ type, items }) => {
          const meta = DEVICE_META[type];
          return (
            <div key={type} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorCls[meta.color]}`}>
                {meta.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{items.length}</p>
                <p className="text-xs text-slate-500">{type}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700">
            {editId ? "Edit Perangkat" : "Daftarkan Perangkat Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe Perangkat</label>
              <div className="grid grid-cols-3 gap-2">
                {(["PWS", "TIIC", "DMC"] as DeviceType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all
                      ${form.type === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <span className={`w-5 h-5 ${colorCls[DEVICE_META[t].color]} rounded p-0.5`}>{DEVICE_META[t].icon}</span>
                    <div className="text-left">
                      <p className="font-bold">{t}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{DEVICE_META[t].label.split(" ").slice(0, 2).join(" ")}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <FormInput label="Nama Perangkat" placeholder="e.g. PWS-Unit-01" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
            <FormInput label="Serial Number" placeholder="e.g. SN-2025-001" value={form.serial} onChange={(v) => setForm((f) => ({ ...f, serial: v }))} required />
            <FormInput label="Alamat IP" placeholder="e.g. 10.0.43.30" value={form.ip} onChange={(v) => setForm((f) => ({ ...f, ip: v }))} required />
            <FormInput label="Port" placeholder="e.g. 4001" value={form.port} onChange={(v) => setForm((f) => ({ ...f, port: v }))} />
            <div className="col-span-2">
              <FormInput label="Lokasi / Deskripsi" placeholder="e.g. Lajur 1 - Masuk" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
            </div>

            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                Batal
              </button>
              <button type="submit"
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                {editId ? "Simpan Perubahan" : "Daftarkan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Device list by group */}
      {grouped.map(({ type, items }) => {
        const meta = DEVICE_META[type];
        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${colorCls[meta.color]}`}>{meta.icon}</span>
              <span className="text-sm font-bold text-slate-700">{type}</span>
              <span className="text-xs text-slate-400">— {meta.label}</span>
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {items.length} perangkat
              </span>
            </div>

            {items.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                <Info24Regular className="w-4 h-4" />
                Belum ada perangkat {type} terdaftar.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((dev) => (
                  <div key={dev.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggle(dev.id)} title={dev.is_active ? "Nonaktifkan" : "Aktifkan"}>
                        {dev.is_active
                          ? <CheckmarkCircle24Filled className="w-5 h-5 text-green-500" />
                          : <Circle24Regular className="w-5 h-5 text-slate-300" />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{dev.name}</p>
                      <p className="text-xs text-slate-500">{dev.serial} · {dev.ip}:{dev.port} {dev.location && `· ${dev.location}`}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0">
                      {new Date(dev.registered_at).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEdit(dev)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit24Regular className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(dev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Delete24Regular className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// FormInput helper
// ─────────────────────────────────────────────
const FormInput: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}> = ({ label, placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
    />
  </div>
);
