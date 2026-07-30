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
@page { size: 140mm 62mm; margin: 0; }
html, body { margin: 0; padding: 0; width: 140mm; height: 62mm; font-family: Arial, Helvetica, sans-serif; }
.sticker, body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { width: 140mm; min-height: 62mm; padding: 2.5mm; }
.sticker {
  width: 100%; min-height: 57mm;
  background: #d90429;
  border: 2mm solid #2b2d42;
  border-radius: 2mm; color: #fff; position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 13mm 4mm 9mm;
}
.main { display: flex; min-height: 34mm; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-1mm); }
.title { font-size: 8.8mm; line-height: .9; font-weight: 900; letter-spacing: .1mm; margin: 0 0 2mm; max-width: 126mm; }
.subtitle { display: flex; flex-direction: column; justify-content: center; gap: .3mm; font-size: 8.4mm; line-height: .92; font-weight: 900; color: #ffea00; text-shadow: 0 1px 0 rgba(0,0,0,.25); }
.subtitle small { display: none; }
.subtitle span { display: block; white-space: nowrap; }
.meta { position: absolute; top: 2.5mm; left: 2.5mm; right: 2.5mm; background: #ffcc99; color: #111; padding: 1.3mm 2mm; border-radius: 1mm; font-weight: 800; font-size: 3.1mm; text-align: left; line-height: 1.2; }
.footer { position: absolute; bottom: 3.5mm; left: 2.5mm; right: 2.5mm; color: #fff; opacity: .95; font-size: 2.7mm; line-height: 1.1; display:flex; justify-content:space-between; align-items:flex-end; gap: 2mm; }
.footer-text { max-width: 98mm; text-align: left; font-weight: 800; }
.badge { display:inline-block; padding: 1.1mm 2.2mm; border-radius: 999px; font-weight:900; font-size: 3.1mm; white-space: nowrap; }
.badge-violation { background:#ffd60a; color:#9a031e; }
.badge-ok { background:#34d399; color:#064e3b; }
@media print {
  body { background: #fff; width: 140mm; height: 62mm; }
  html, body, .page { overflow: hidden; }
  .sticker { background: #d90429 !important; }
}
</style>
</head>
<body onload="window.focus(); window.print();">
  <div class="page">
    <div class="sticker">
      <div class="meta">NO. POLISI: <strong>${plate}</strong><br/>TANGGAL: <strong>${formattedDate}</strong></div>
      <div class="main">
        <div class="title">KENDARAAN INI</div>
        <div class="subtitle">
          ${violationLines.map((line) => `<span>${line}</span>`).join("")}
        </div>
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
    window.alert("Popup diblokir. Izinkan popup untuk mencetak stiker.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
