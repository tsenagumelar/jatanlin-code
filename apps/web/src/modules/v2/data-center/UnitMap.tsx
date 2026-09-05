"use client";

import { useEffect, useRef } from "react";

export type UnitSite = {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  region: string;
  status: "active" | "inactive" | "maintenance";
  totalToday: number;
  violations: number;
  isCurrent?: boolean;
  officer?: {
    name: string;
    badge: string;
    rank: string;
    phone?: string;
  };
};

export type EnforcementPoint = {
  id: string;
  lat: number;
  lng: number;
  plateNo: string;
  violationType: "OL" | "OD" | "OLOD" | "normal";
  weight: number;
  date: string;
  siteName: string;
};

interface UnitMapProps {
  sites: UnitSite[];
  mode: "units" | "enforcement";
  enforcementPoints?: EnforcementPoint[];
  selectedSite?: string | null;
  onSiteClick?: (site: UnitSite) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#16a34a",
  inactive: "#9ca3af",
  maintenance: "#d97706",
};

const VIOLATION_COLORS: Record<string, string> = {
  OL: "#dc2626",
  OD: "#ea580c",
  OLOD: "#7c3aed",
  normal: "#16a34a",
};

export default function UnitMap({
  sites,
  mode,
  enforcementPoints = [],
  selectedSite,
  onSiteClick,
}: UnitMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMap = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic import to avoid SSR
    import("leaflet").then((L) => {
      // Fix default icon URLs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: [-6.2, 106.8],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;
      markersRef.current = [];

      if (mode === "units") {
        sites.forEach((site) => {
          const color = STATUS_COLORS[site.status] ?? "#6b7280";
          const size = site.isCurrent ? 18 : 14;
          const borderWidth = site.isCurrent ? 3 : 2;
          const isSelected = selectedSite === site.id;

          const icon = L.divIcon({
            className: "",
            html: `
              <div style="
                width:${size}px;height:${size}px;
                background:${color};
                border:${borderWidth}px solid ${isSelected ? "#1d4ed8" : "#fff"};
                border-radius:50%;
                box-shadow:0 2px 8px rgba(0,0,0,0.35);
                ${site.isCurrent ? "box-shadow:0 0 0 4px rgba(37,99,235,0.3),0 2px 8px rgba(0,0,0,0.3);" : ""}
                cursor:pointer;
              "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const officerHtml = site.officer
            ? `
            <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb;font-size:11px">
              <div style="color:#6b7280;margin-bottom:2px">Petugas</div>
              <div style="font-weight:700;color:#111">${site.officer.rank} ${site.officer.name}</div>
              <div style="color:#6b7280">${site.officer.badge}${site.officer.phone ? " · " + site.officer.phone : ""}</div>
            </div>
          `
            : "";

          const marker = L.marker([site.lat, site.lng], { icon }).addTo(map)
            .bindPopup(`
              <div style="font-family:system-ui,sans-serif;min-width:190px">
                <div style="font-weight:700;font-size:14px;color:#111;margin-bottom:2px">
                  ${site.name}
                </div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:8px">${site.region} · <strong>${site.code}</strong></div>
                <div style="display:flex;gap:12px;font-size:12px">
                  <div><span style="color:#6b7280">Hari ini</span><br/><strong style="font-size:14px">${site.totalToday}</strong></div>
                  <div><span style="color:#6b7280">Pelanggaran</span><br/><strong style="font-size:14px;color:#dc2626">${site.violations}</strong></div>
                </div>
                ${officerHtml}
                <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb">
                  <span style="
                    display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;
                    background:${color}22;color:${color};
                  ">${site.status === "active" ? "Aktif" : site.status === "inactive" ? "Tidak Aktif" : "Perawatan"}</span>
                </div>
              </div>
            `);

          marker.on("click", () => onSiteClick?.(site));
          markersRef.current.push(marker);
        });

        if (sites.length > 0) {
          const group = L.featureGroup(markersRef.current);
          map.fitBounds(group.getBounds().pad(0.2));
        }
      } else {
        // Enforcement / historical mode
        enforcementPoints.forEach((pt) => {
          const color = VIOLATION_COLORS[pt.violationType] ?? "#6b7280";
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:10px;height:10px;background:${color};
              border:2px solid #fff;border-radius:50%;
              box-shadow:0 1px 4px rgba(0,0,0,0.4);
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });

          L.marker([pt.lat, pt.lng], { icon }).addTo(map).bindPopup(`
              <div style="font-family:system-ui,sans-serif;min-width:160px">
                <div style="font-weight:700;font-size:13px;margin-bottom:4px">${pt.plateNo}</div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${pt.siteName} · ${pt.date}</div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="
                    padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;
                    background:${color}22;color:${color};
                  ">${pt.violationType === "OL" ? "Over Loading" : pt.violationType === "OD" ? "Over Dimension" : pt.violationType === "OLOD" ? "OL & OD" : "Normal"}</span>
                  <span style="font-size:12px;font-weight:600">${pt.weight.toFixed(1)} ton</span>
                </div>
              </div>
            `);
        });

        if (enforcementPoints.length > 0) {
          const allMarkers = L.featureGroup(
            enforcementPoints.map((p) => L.marker([p.lat, p.lng])),
          );
          map.fitBounds(allMarkers.getBounds().pad(0.3));
        } else {
          map.setView([-6.2, 106.8], 8);
        }
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, mode, enforcementPoints, selectedSite]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
    </>
  );
}
