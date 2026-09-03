#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const mode = process.argv[2] || "summary";
const sitePath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(rootDir, "site.json");

function readSite() {
  const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
  const required = ["id", "code", "name"];
  for (const key of required) {
    if (!String(site[key] || "").trim()) {
      throw new Error(`site.json missing required field: ${key}`);
    }
  }
  return site;
}

function siteEnv(site) {
  const wb = site.wb || {};
  const contact = site.contact || {};
  const admin = site.admin || {};
  const license = site.license || {};
  const etle = site.etle || {};
  const jurisdiction = etle.jurisdiction || {};
  const modules = Array.isArray(license.modules) ? license.modules.join(",") : String(license.modules || "PWS,TIIC,DMC");

  return {
    SITE_CODE: site.code,
    SITE_ID: site.id,
    SITE_NAME: site.name,
    SITE_LOCATION: site.location || "",
    SITE_REGION: site.region || "",
    SITE_ADDRESS: site.address || "",
    SITE_CITY: site.city || "",
    SITE_PROVINCE: site.province || "",
    SITE_TIMEZONE: site.timezone || "Asia/Jakarta",
    SITE_CONTACT_NAME: contact.name || "",
    SITE_CONTACT_PHONE: contact.phone || "",
    DEFAULT_ADMIN_USERNAME: admin.username || "admin",
    DEFAULT_ADMIN_PASSWORD: admin.password || "admin123",
    DEFAULT_ADMIN_FULL_NAME: admin.fullName || "Administrator",
    DEFAULT_ADMIN_BADGE_NO: admin.badgeNo || "ADM-001",
    DEFAULT_ADMIN_PHONE: admin.phone || "",
    DEFAULT_ADMIN_EMAIL: admin.email || "admin@local.test",
    WB_SITE_CODE: wb.siteCode || site.code,
    WB_SITE_ID: wb.siteId || site.id,
    WB_LOCATION_CODE: wb.locationCode || "GATE-A1",
    NEXT_PUBLIC_SITE_ID: site.id,
    NEXT_PUBLIC_SITE_CODE: site.code,
    NEXT_PUBLIC_SITE_NAME: site.name,
    NEXT_PUBLIC_SITE_LOCATION: site.location || "",
    NEXT_PUBLIC_SITE_REGION: site.region || "",
    ETLE_DEVICE_NAME: etle.deviceName || "",
    ETLE_CAMERA_TYPE: etle.cameraType || "ANPR Camera",
    ETLE_LOCATION_NAME: etle.locationName || site.location || "",
    ETLE_LOCATION_DESCRIPTION: etle.locationDescription || site.address || "",
    ETLE_LAT: String(etle.latitude ?? ""),
    ETLE_LON: String(etle.longitude ?? ""),
    ETLE_SATWIL: etle.satwil || "",
    ETLE_NRP: String(etle.nrp ?? ""),
    ETLE_PROVINCE: jurisdiction.province || site.province || "",
    ETLE_COURT: jurisdiction.court || "",
    ETLE_PROSECUTOR: jurisdiction.prosecutor || "",
    VEAM_ISSUED_BY: license.issuedBy || "Activa Digital",
    VEAM_EXPIRES_AT: license.expiresAt || "2027-12-31",
    VEAM_MODULES: modules,
    VEAM_MAX_DEVICES: String(license.maxDevices || 5),
    VEAM_HARDWARE_ID: license.hardwareId || ""
  };
}

function envQuote(value) {
  const text = String(value ?? "");
  if (text === "" || /^[A-Za-z0-9_./:@,+-]+$/.test(text)) return text;
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`")}"`;
}

function shellQuote(value) {
  return `'${String(value ?? "").replace(/'/g, "'\\''")}'`;
}

function updateEnvFile(filePath, updates) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${envQuote(value)}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      if (!content.endsWith("\n")) content += "\n";
      content += `${line}\n`;
    }
  }
  fs.writeFileSync(filePath, content);
  return true;
}

function updateWbAppSettings(filePath, env) {
  if (!fs.existsSync(filePath)) return false;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  raw.SITE_CODE = env.SITE_CODE;
  raw.SITE_NAME = env.SITE_NAME;
  raw.SITE_LOCATION = env.SITE_LOCATION;
  raw.SITE_REGION = env.SITE_REGION;
  raw.WB_SITE_CODE = env.WB_SITE_CODE;
  raw.WB_SITE_ID = env.WB_SITE_ID;
  if (raw.WB) {
    raw.WB.SiteCode = env.WB_SITE_CODE;
    raw.WB.SiteId = env.WB_SITE_ID;
    raw.WB.SiteName = env.SITE_NAME;
    raw.WB.SiteLocation = env.SITE_LOCATION;
    raw.WB.SiteRegion = env.SITE_REGION;
    raw.WB.LocationCode = env.WB_LOCATION_CODE;
  }
  fs.writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`);
  return true;
}

const site = readSite();
const env = siteEnv(site);

if (mode === "shell") {
  for (const [key, value] of Object.entries(env)) {
    process.stdout.write(`${key}=${shellQuote(value)}\nexport ${key}\n`);
  }
} else if (mode === "apply") {
  const rootEnvKeys = Object.keys(env);
  const serviceEnvKeys = rootEnvKeys.filter((key) => !key.startsWith("NEXT_PUBLIC_") && !key.startsWith("ETLE_"));
  // ETLE_* is read server-side by the web app's route handler, so it ships with the web env.
  const webEnvKeys = rootEnvKeys.filter((key) => key.startsWith("NEXT_PUBLIC_") || key.startsWith("ETLE_"));
  const wbEnvKeys = serviceEnvKeys.filter((key) => key.startsWith("SITE_") || key.startsWith("WB_"));

  const files = [
    [".env", rootEnvKeys],
    [".env.example", rootEnvKeys],
    ["services/backend/.env", serviceEnvKeys],
    ["services/backend/.env.example", serviceEnvKeys],
    ["services/wb-agent/.env", wbEnvKeys],
    ["services/wb-agent/.env.example", wbEnvKeys],
    ["apps/web/.env", webEnvKeys],
    ["apps/web/.env.example", webEnvKeys]
  ];

  for (const [file, keys] of files) {
    const updated = updateEnvFile(path.join(rootDir, file), Object.fromEntries(keys.map((key) => [key, env[key]])));
    if (updated) process.stdout.write(`site_apply=updated ${file}\n`);
  }
  if (updateWbAppSettings(path.join(rootDir, "services/wb-agent/appsettings.json"), env)) {
    process.stdout.write("site_apply=updated services/wb-agent/appsettings.json\n");
  }
} else {
  process.stdout.write(`${env.SITE_CODE} | ${env.SITE_ID} | ${env.SITE_NAME}\n`);
}
