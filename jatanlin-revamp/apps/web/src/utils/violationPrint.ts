type PrintViolationStickerOptions = {
  plateNo?: string | null;
  violationType?: string | null;
  date?: Date;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isPrintableViolation(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return !!normalized && normalized !== "normal" && normalized !== "pending";
}

export function printViolationSticker({
  plateNo,
  violationType,
  date = new Date(),
}: PrintViolationStickerOptions) {
  if (typeof window === "undefined") return;

  const plate = escapeHtml(plateNo || "-");
  const formattedDate = escapeHtml(
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  );
  const normalizedViolation = violationType?.toLowerCase() || "";
  const isViolation = isPrintableViolation(violationType);
  const activeText = isViolation ? "ODOL" : "NORMAL";
  const isDimension =
    normalizedViolation.includes("dimensi") ||
    normalizedViolation.includes("dimension");
  const isWeight =
    normalizedViolation.includes("berat") ||
    normalizedViolation.includes("loading");
  const isBoth = isDimension && isWeight;
  const violationLines = isBoth
    ? ["OVER DIMENSION", "OVER LOADING"]
    : isDimension
      ? ["OVER DIMENSION"]
      : isWeight
        ? ["OVER LOADING"]
        : isViolation
          ? [escapeHtml(violationType || "ODOL")]
          : ["NORMAL"];

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Sticker ODOL</title>
<style>
* { box-sizing: border-box; }
@page { size: 100mm 62mm; margin: 0; }
html, body { margin: 0; padding: 0; width: 100mm; height: 62mm; font-family: Arial, Helvetica, sans-serif; }
.sticker, body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { width: 100mm; min-height: 62mm; padding: 2.5mm; }
.sticker {
  width: 100%; min-height: 57mm;
  background: #d90429;
  border: 2mm solid #2b2d42;
  border-radius: 2mm; color: #fff; position: relative;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 15mm 3mm 10mm;
}
.title { font-size: 6mm; line-height: .96; font-weight: 900; letter-spacing: .1mm; margin: 1mm 0 4mm; max-width: 90mm; }
.subtitle { display: flex; min-height: 18mm; flex-direction: column; justify-content: center; gap: .8mm; font-size: 4.2mm; line-height: 1.05; font-weight: 900; color: #ffea00; text-shadow: 0 1px 0 rgba(0,0,0,.25); }
.subtitle small { display: none; }
.subtitle span { display: block; white-space: nowrap; }
.meta { position: absolute; top: 2.5mm; left: 2.5mm; right: 2.5mm; background: #ffcc99; color: #111; padding: 1.2mm 1.5mm; border-radius: 1mm; font-weight: 700; font-size: 2.5mm; text-align: left; line-height: 1.25; }
.footer { position: absolute; bottom: 4mm; left: 2.5mm; right: 2.5mm; color: #fff; opacity: .95; font-size: 2.1mm; line-height: 1.14; display:flex; justify-content:space-between; align-items:flex-end; gap: 1.5mm; }
.footer-text { max-width: 68mm; text-align: left; }
.badge { display:inline-block; padding: 1mm 1.8mm; border-radius: 999px; font-weight:800; font-size: 2.5mm; white-space: nowrap; }
.badge-violation { background:#ffd60a; color:#9a031e; }
.badge-ok { background:#34d399; color:#064e3b; }
@media print {
  body { background: #fff; width: 100mm; height: 62mm; }
  html, body, .page { overflow: hidden; }
  .sticker { background: #d90429 !important; }
}
</style>
</head>
<body onload="window.focus(); window.print();">
  <div class="page">
    <div class="sticker">
      <div class="meta">NO. POLISI: <strong>${plate}</strong><br/>TANGGAL: <strong>${formattedDate}</strong></div>
      <div class="title">KENDARAAN INI</div>
      <div class="subtitle">
        ${violationLines.map((line) => `<span>${line}</span>`).join("")}
      </div>
      <div class="footer">
        <div class="footer-text">OPERASI PENERTIBAN KENDARAAN OVER DIMENSION &amp; OVER LOADING</div>
        <div class="${
          isViolation ? "badge badge-violation" : "badge badge-ok"
        }">${activeText}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "PRINT_STICKER", "width=1400,height=900");
  if (!printWindow) {
    window.alert("Popup was blocked. Please allow popups to print the sticker.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
