type PrintViolationStickerOptions = {
  plateNo?: string | null;
  violationType?: string | null;
  weightKg?: string | number | null;
  lengthM?: string | number | null;
  widthM?: string | number | null;
  heightM?: string | number | null;
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
  weightKg,
  lengthM,
  widthM,
  heightM,
  date = new Date(),
}: PrintViolationStickerOptions) {
  if (typeof window === "undefined") return;

  const rawPlate = plateNo?.trim() || "-";
  const plateCharacters = Array.from(rawPlate)
    .map((character) => `<span>${escapeHtml(character)}</span>`)
    .join("");
  const formattedDate = escapeHtml(
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  );
  const parsedWeight = Number(weightKg);
  const formattedWeight = escapeHtml(
    Number.isFinite(parsedWeight) && parsedWeight > 0
      ? `${parsedWeight.toLocaleString("id-ID")} TON`
      : "-",
  );
  const formatDimension = (value?: string | number | null) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed.toLocaleString("id-ID", { maximumFractionDigits: 2 })
      : "-";
  };
  const formattedDimensions = escapeHtml(
    `${formatDimension(lengthM)} × ${formatDimension(widthM)} × ${formatDimension(heightM)} m`,
  );

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title></title>
<style>
* { box-sizing: border-box; }
@page { size: 280mm 100mm; margin: 0; }
html, body { margin: 0; padding: 0; width: 280mm; height: 100mm; font-family: Arial, Helvetica, sans-serif; }
.sticker, body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { width: 280mm; height: 100mm; padding: 0; }
.sticker {
  width: 100%; height: 100mm;
  margin-bottom: 10mm;
  background: #fff;
  border: 0; border-radius: 0; color: #111; position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 0; gap: 0;
}
.main { display: flex; flex: 1; flex-direction: column; align-items: stretch; justify-content: flex-start; padding-top: 10mm; }
.nopol {  font-size: 6.2mm; }
.plate { width: 100%; display: flex; align-items: center; justify-content: space-between; font-size: 40mm; line-height: .92; color: #d90429; font-weight: 900; }
.plate span { white-space: pre; }
.details { margin-top:20mm; width: 100%; border-top: .45mm solid #222; padding: 1mm 3mm 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1mm; font-size: 6.2mm; font-weight: 700; text-align: center; }
.details strong { display: block; margin-top: .25mm; font-size: 8.5mm; color: #d90429; overflow-wrap: anywhere; }
@media print {
  body { background: #fff; width: 280mm; height: 100mm; }
  html, body, .page { overflow: hidden; }
  .sticker { background: #fff !important;  }
}
</style>
</head>
<body onload="window.focus(); window.print();">
  <div class="page">
    <div class="sticker">
      <div class="main">
        <div class="nopol"><strong>Nomor Polisi</strong></div>
        <div class="plate">${plateCharacters}</div>
      </div>

      <div class="details">
        <div>TANGGAL<strong>${formattedDate}</strong></div>
        <div>BERAT<strong>${formattedWeight}</strong></div>
        <div>DIMENSI (P × L × T)<strong>${formattedDimensions}</strong></div>
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
