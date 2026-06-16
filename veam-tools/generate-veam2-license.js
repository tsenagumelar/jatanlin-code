#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    args[key] = val;
  }
  return args;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function oneYearFromNow() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function b64url(input) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function signingMessage(license) {
  const modules = [...license.modules].sort().join(",");
  const parts = [
    "VEAM2",
    license.version,
    license.license_id,
    license.site_id,
    license.issued_to,
    license.issued_by,
    license.issued_at,
    license.expires_at,
    modules,
    String(license.max_devices),
    license.hardware_id || "",
  ];

  return crypto.createHash("sha256").update(parts.join("\n"), "utf8").digest("base64");
}

function loadOrCreateKeyPair(privateKeyPath) {
  if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    const privateKey = crypto.createPrivateKey(fs.readFileSync(privateKeyPath));
    const publicKey = crypto.createPublicKey(privateKey);
    return { privateKey, publicKey, created: false };
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  if (privateKeyPath) {
    fs.mkdirSync(path.dirname(privateKeyPath), { recursive: true });
    fs.writeFileSync(
      privateKeyPath,
      privateKey.export({ type: "pkcs8", format: "pem" }),
      { mode: 0o600 }
    );
  }
  return { privateKey, publicKey, created: true };
}

function rawPublicKeyB64(publicKey) {
  const der = publicKey.export({ type: "spki", format: "der" });
  return Buffer.from(der).subarray(-32).toString("base64");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["site-id"]) {
    console.error("Error: --site-id wajib diisi");
    process.exit(1);
  }
  if (!args["issued-to"]) {
    console.error("Error: --issued-to wajib diisi");
    process.exit(1);
  }

  const keyPath = args["private-key"] || "./veam-tools/keys/veam-ed25519-private.pem";
  const { privateKey, publicKey, created } = loadOrCreateKeyPair(keyPath);
  const siteId = args["site-id"];
  const issuedAt = args["issued-at"] || today();
  const expiresAt = args.expiry || oneYearFromNow();
  const modules = (args.modules || "PWS,TIIC,DMC")
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  const license = {
    version: "2.0",
    license_id: args["license-id"] || `VEAM2-${new Date().getFullYear()}-${siteId.slice(0, 8).toUpperCase()}`,
    site_id: siteId,
    issued_to: args["issued-to"],
    issued_by: args["issued-by"] || "Activa Digital",
    issued_at: issuedAt,
    expires_at: expiresAt,
    modules,
    max_devices: Number.parseInt(args["max-devices"] || "5", 10),
    ...(args["hardware-id"] ? { hardware_id: args["hardware-id"] } : {}),
  };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(license.issued_at) || !/^\d{4}-\d{2}-\d{2}$/.test(license.expires_at)) {
    console.error("Error: tanggal harus format YYYY-MM-DD");
    process.exit(1);
  }
  if (!Number.isInteger(license.max_devices) || license.max_devices < 1) {
    console.error("Error: --max-devices harus angka positif");
    process.exit(1);
  }

  const signature = crypto.sign(null, Buffer.from(signingMessage(license), "utf8"), privateKey);
  const signedLicense = { ...license, signature: signature.toString("base64") };
  const json = JSON.stringify(signedLicense);
  const output = `VEAM2.${b64url(json)}`;
  const outputPath = args.output || "./license.veam";

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");

  console.log("VEAM2 license created");
  console.log(`Path: ${path.resolve(outputPath)}`);
  console.log(`Private key: ${path.resolve(keyPath)}${created ? " (created)" : ""}`);
  console.log(`Backend VEAM_PUBLIC_KEY_B64: ${rawPublicKeyB64(publicKey)}`);
  console.log(`License ID: ${signedLicense.license_id}`);
  console.log(`Site ID: ${signedLicense.site_id}`);
  console.log(`Expires: ${signedLicense.expires_at}`);
}

main();
