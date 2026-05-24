#!/usr/bin/env node
/**
 * VEAM License Key Generator — v2.0 (AES-256-GCM)
 * ──────────────────────────────────────────────────────────────────
 * File .veam yang dihasilkan dienkripsi dengan AES-256-GCM.
 * Tanpa encryption key yang tertanam di aplikasi, file ini tidak
 * bisa dibaca oleh siapapun — bukan sekadar Base64.
 *
 * Format output .veam:
 *   [24 hex = IV 12-byte][N hex = ciphertext][32 hex = GCM auth tag]
 *   → Semua digabung jadi satu hex string.
 *
 * Usage:
 *   node generate-veam-key.js [options]
 *
 * Options:
 *   --site-id <uuid>        Site UUID (dari NEXT_PUBLIC_SITE_ID)       [required]
 *   --issued-to <name>      Nama instansi penerima lisensi             [required]
 *   --expiry <YYYY-MM-DD>   Tanggal kadaluarsa (default: 1 tahun)
 *   --modules <list>        PWS,TIIC,DMC (default: semua)
 *   --max-devices <n>       Jumlah maksimum perangkat (default: 5)
 *   --hardware-id <id>      Hardware ID opsional
 *   --output <path>         Path output .veam (default: ./license.veam)
 *
 * Examples:
 *   node generate-veam-key.js \
 *     --site-id e1123daf-a4db-4ee1-88da-ba9bff382f45 \
 *     --issued-to "Polda Metro Jaya - Jatanlin" \
 *     --expiry 2026-12-31 \
 *     --output ./output/MST-25-00001.veam
 */

"use strict";

const crypto = require("crypto");
const fs     = require("fs");
const path   = require("path");

// ══════════════════════════════════════════════════════════════════
//  ⚠️  ENCRYPTION KEY — JAGA KERAHASIAAN INI
//  Key AES-256-GCM 32-byte. Harus identik antara generator dan
//  frontend app. Jangan share atau commit ke public repository.
// ══════════════════════════════════════════════════════════════════
const VEAM_AES_KEY_HEX = "e75358d72bf90c6f8c30b96fe3832f4b137be9c18c91db7e438e2b7a0cdd44ac";

// ── Signature key (HMAC-SHA256 untuk integritas data) ─────────────
const VEAM_HMAC_KEY = "VEAM-ACTIVA-2025-HMAC-S3CR3T-K3Y";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function computeSignature(lic) {
  const payload = [
    lic.license_id,
    lic.site_id,
    lic.issued_to,
    lic.issued_date,
    lic.expiry_date,
    lic.modules.join(","),
    String(lic.max_devices),
    VEAM_HMAC_KEY,
  ].join("|");
  return sha256Hex(payload);
}

/**
 * Enkripsi string JSON dengan AES-256-GCM.
 * Output: hex string  =  IV(24) + ciphertext(N) + authTag(32)
 */
function encryptLicense(jsonStr) {
  const key    = Buffer.from(VEAM_AES_KEY_HEX, "hex"); // 32 bytes
  const iv     = crypto.randomBytes(12);               // 12 bytes = 24 hex chars
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(jsonStr, "utf8", "hex");
  encrypted    += cipher.final("hex");

  const authTag = cipher.getAuthTag(); // 16 bytes = 32 hex chars
  return iv.toString("hex") + encrypted + authTag.toString("hex");
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function oneYearFromNow() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args["site-id"]) {
    console.error("❌ Error: --site-id wajib diisi");
    console.error('   Contoh: node generate-veam-key.js --site-id e1123daf-... --issued-to "Nama"');
    process.exit(1);
  }
  if (!args["issued-to"]) {
    console.error("❌ Error: --issued-to wajib diisi");
    process.exit(1);
  }

  const siteId     = args["site-id"];
  const issuedTo   = args["issued-to"];
  const issuedBy   = "Activa Digital";
  const issuedDate = today();
  const expiryDate = args["expiry"] || oneYearFromNow();
  const modulesRaw = args["modules"] || "PWS,TIIC,DMC";
  const modules    = modulesRaw.split(",").map((m) => m.trim().toUpperCase());
  const maxDevices = parseInt(args["max-devices"] || "5", 10);
  const hardwareId = args["hardware-id"] || undefined;
  const outputPath = args["output"] || "./license.veam";
  const licenseId  = `VEAM-${new Date().getFullYear()}-${siteId.slice(0, 8).toUpperCase()}`;

  // Validate modules
  const validModules = ["PWS", "TIIC", "DMC"];
  for (const m of modules) {
    if (!validModules.includes(m)) {
      console.error(`❌ Error: Modul tidak valid: ${m}. Valid: PWS, TIIC, DMC`);
      process.exit(1);
    }
  }

  // Validate expiry
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    console.error("❌ Error: Format expiry tidak valid. Gunakan YYYY-MM-DD");
    process.exit(1);
  }

  // Build license payload
  const licenseBase = {
    version:     "1.0",
    license_id:  licenseId,
    site_id:     siteId,
    issued_to:   issuedTo,
    issued_by:   issuedBy,
    issued_date: issuedDate,
    expiry_date: expiryDate,
    modules,
    max_devices: maxDevices,
    ...(hardwareId ? { hardware_id: hardwareId } : {}),
  };

  const signature = computeSignature(licenseBase);
  const license   = { ...licenseBase, signature };
  const jsonStr   = JSON.stringify(license);

  // Enkripsi dengan AES-256-GCM
  const encrypted = encryptLicense(jsonStr);

  // Verifikasi round-trip sebelum nulis file
  try {
    const keyBuf    = Buffer.from(VEAM_AES_KEY_HEX, "hex");
    const ivBuf     = Buffer.from(encrypted.slice(0, 24), "hex");
    const tagBuf    = Buffer.from(encrypted.slice(-32), "hex");
    const ctBuf     = Buffer.from(encrypted.slice(24, -32), "hex");
    const decipher  = crypto.createDecipheriv("aes-256-gcm", keyBuf, ivBuf);
    decipher.setAuthTag(tagBuf);
    let dec = decipher.update(ctBuf, undefined, "utf8");
    dec    += decipher.final("utf8");
    const parsed = JSON.parse(dec);
    if (parsed.license_id !== licenseId) throw new Error("Round-trip mismatch");
  } catch (e) {
    console.error("❌ Verifikasi enkripsi gagal:", e.message);
    process.exit(1);
  }

  // Write file
  const outDir = path.dirname(outputPath);
  if (outDir !== "." && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, encrypted, "utf8");

  const fileSizeBytes = Buffer.byteLength(encrypted, "utf8");

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      VEAM LICENSE KEY GENERATOR v2.0 (AES-256-GCM)  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("✅ File lisensi berhasil dibuat & dienkripsi:");
  console.log(`   📄 Path      : ${path.resolve(outputPath)}`);
  console.log(`   📦 Enkripsi  : AES-256-GCM (tidak bisa dibaca tanpa key)`);
  console.log(`   📏 Ukuran    : ${fileSizeBytes} bytes`);
  console.log(`   🔑 License   : ${license.license_id}`);
  console.log(`   🏢 Untuk     : ${license.issued_to}`);
  console.log(`   📍 Site ID   : ${license.site_id}`);
  console.log(`   📅 Terbit    : ${license.issued_date}`);
  console.log(`   ⏳ Expiry    : ${license.expiry_date}`);
  console.log(`   🔧 Modul     : ${license.modules.join(", ")}`);
  console.log(`   📱 Max Dev   : ${license.max_devices}`);
  if (hardwareId) console.log(`   💻 HW ID     : ${hardwareId}`);
  console.log(`   🔏 Sig       : ${signature.slice(0, 24)}…`);
  console.log(`   ✔️  Verified  : Round-trip decrypt OK`);
  console.log("");
  console.log("🔒 Keamanan:");
  console.log("   • File dienkripsi AES-256-GCM — tidak bisa di-Base64-decode");
  console.log("   • IV 12-byte random berbeda setiap generate");
  console.log("   • GCM Auth Tag mencegah modifikasi konten");
  console.log("   • Tanpa key 256-bit dari Activa Digital, file tidak bisa dibaca");
  console.log("");
  console.log("📋 Cara penggunaan:");
  console.log(`   1. Salin file "${path.basename(outputPath)}" ke USB flashdisk`);
  console.log("   2. Tancapkan USB ke komputer JATANLIN");
  console.log("   3. Buka VEAM → License → Upload file atau Scan USB");
  console.log("");
}

main();
