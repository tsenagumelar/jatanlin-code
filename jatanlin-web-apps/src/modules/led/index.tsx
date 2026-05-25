"use client";

import React, { useEffect } from "react";
import { Spinner, makeStyles, shorthands } from "@fluentui/react-components";
import {
  CheckmarkCircle24Filled,
  Warning24Filled,
} from "@fluentui/react-icons";
import { useProcessing } from "@/src/contexts/ProcessingContext";

  const useStyles = makeStyles({
  container: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000000",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...shorthands.padding("24px"),
    ...shorthands.overflow("hidden"),
  },
  ledFrame: {
    width: "100%",
    maxWidth: "1800px",
    aspectRatio: "21 / 9",
    backgroundColor: "#000000",
    ...shorthands.borderRadius("24px"),
    ...shorthands.border("8px", "solid", "#1e293b"),
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    position: "relative",
    ...shorthands.overflow("hidden"),
  },
  ledGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    pointerEvents: "none",
    backgroundImage:
      "radial-gradient(circle, rgba(148, 163, 184, 0.5) 1.5px, transparent 1.5px)",
    backgroundSize: "8px 8px",
  },
  contentWrapper: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("48px"),
    ...shorthands.gap("32px"),
  },
  iconWrapper: {
    marginBottom: "16px",
  },
  mainTitle: {
    fontSize: "96px",
    fontWeight: 700,
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    textAlign: "center",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "72px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textAlign: "center",
    lineHeight: 1.2,
    marginTop: "16px",
  },
  titleGreenGlow: {
    color: "#34d399",
    textShadow:
      "0 0 20px rgba(52, 211, 153, 0.8), 0 0 40px rgba(52, 211, 153, 0.4)",
  },
  titleBlueGlow: {
    color: "#60a5fa",
    textShadow:
      "0 0 20px rgba(96, 165, 250, 0.8), 0 0 40px rgba(96, 165, 250, 0.4)",
  },
  titleRedGlow: {
    color: "#f87171",
    textShadow:
      "0 0 20px rgba(248, 113, 113, 0.8), 0 0 40px rgba(248, 113, 113, 0.4)",
  },
  subtitleGreen: {
    color: "rgba(52, 211, 153, 0.9)",
  },
  subtitleBlue: {
    color: "rgba(96, 165, 250, 0.9)",
  },
  subtitleRed: {
    color: "rgba(248, 113, 113, 0.9)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "128px",
  },
  bottomGlowGreen: {
    background: "linear-gradient(to top, rgba(6, 78, 59, 0.5), transparent)",
  },
  bottomGlowBlue: {
    background: "linear-gradient(to top, rgba(30, 58, 138, 0.5), transparent)",
  },
  bottomGlowRed: {
    background: "linear-gradient(to top, rgba(127, 29, 29, 0.5), transparent)",
  },
  stepIndicator: {
    marginTop: "32px",
    display: "flex",
    justifyContent: "center",
    ...shorthands.gap("12px"),
  },
  stepDot: {
    height: "12px",
    width: "64px",
    ...shorthands.borderRadius("9999px"),
    transition: "all 0.3s ease",
  },
  stepDotActive: {
    boxShadow: "0 0 12px rgba(52, 211, 153, 0.8)",
  },
  stepDotCompleted: {
    backgroundColor: "#475569",
  },
  stepDotWaiting: {
    backgroundColor: "#1e293b",
  },
  infoPanel: {
    marginTop: "32px",
    width: "100%",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    ...shorthands.gap("24px"),
    maxWidth: "1600px",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "16px",
  },
  infoGridFour: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    ...shorthands.gap("24px"),
  },
  infoCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    ...shorthands.border("2px", "solid", "#475569"),
    ...shorthands.borderRadius("20px"),
    ...shorthands.padding("36px"),
    textAlign: "center",
  },
  infoCardGreen: {
    ...shorthands.borderColor("#10b981"),
  },
  infoCardBlue: {
    ...shorthands.borderColor("#3b82f6"),
  },
  infoLabel: {
    fontSize: "25px",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "40px",
  },
  infoLabelGreen: {
    color: "#34d399",
  },
  infoLabelBlue: {
    color: "#60a5fa",
  },
  infoValue: {
    fontSize: "45px",
    fontWeight: 900,
    color: "#ffffff",
  },
  spinnerWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  enterButton: {
    position: "absolute",
    top: "24px",
    left: "24px",
    zIndex: 20,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    color: "#e2e8f0",
    ...shorthands.border("2px", "solid", "#475569"),
    ...shorthands.borderRadius("9999px"),
    ...shorthands.padding("8px", "16px"),
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
  },
  exitButton: {
    position: "absolute",
    top: "24px",
    right: "24px",
    zIndex: 20,
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(127, 29, 29, 0.9)",
    color: "#fee2e2",
    ...shorthands.border("2px", "solid", "#ef4444"),
    ...shorthands.borderRadius("9999px"),
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
});

interface LedDisplayProps {
  showEnterFullscreen?: boolean;
  showExitFullscreen?: boolean;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}

export default function LedDisplay({
  showEnterFullscreen = false,
  showExitFullscreen = false,
  onEnterFullscreen,
  onExitFullscreen,
}: LedDisplayProps) {
  const styles = useStyles();
  const formatDecimal = (value: unknown, fractionDigits = 1) =>
    typeof value === "number" ? value.toFixed(fractionDigits) : "-";
  const formatWeight = (value: unknown) =>
    typeof value === "number" ? value.toLocaleString("id-ID") : "-";

  // Use Processing Context to get all data from processing page
  const {
    steps,
    currentStepId,
    anprData,
    weightData,
    axleData,
    dimensionData,
    violationResult,
  } = useProcessing();

  // Auto-update display based on processing data
  // LED display is now purely presentational and follows processing state
  useEffect(() => {
    console.log("🖥️ LED Display Update:", {
      currentStepId,
      steps: steps.map(s => ({ id: s.id, status: s.status })),
      hasAnprData: !!anprData,
      hasWeightData: !!weightData,
      hasAxleData: !!axleData,
      hasDimensionData: !!dimensionData,
      violationResult,
    });
  }, [currentStepId, anprData, weightData, axleData, dimensionData, violationResult, steps]);

  const getDisplayContent = () => {
    switch (currentStepId) {
      case 1:
        return {
          title: "SISTEM SIAP",
          subtitle: "Silakan Masuk ke Area Penimbangan",
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };

      case 2:
        if (!anprData) {
          return {
            title: "MENDETEKSI PLAT NOMOR",
            subtitle: "Mohon Tunggu...",
            icon: (
              <div className={styles.spinnerWrapper}>
                <Spinner
                  size="huge"
                  style={{ transform: "scale(3)", color: "#60a5fa" }}
                />
              </div>
            ),
            color: "blue" as const,
          };
        }
        return {
          title: anprData.plate_no,
          subtitle: `Akurasi: ${formatDecimal(anprData.confidence)}%`,
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };

      case 3:
        if (!weightData) {
          return {
            title: "SEDANG MENIMBANG",
            subtitle: "Kendaraan Tetap di Timbangan",
            icon: (
              <div className={styles.spinnerWrapper}>
                <Spinner
                  size="huge"
                  style={{ transform: "scale(3)", color: "#60a5fa" }}
                />
              </div>
            ),
            color: "blue" as const,
          };
        }
        return {
          title: `${formatWeight(weightData.total_weight)} KG`,
          subtitle: weightData.total_axle ? `Jumlah Sumbu: ${weightData.total_axle}` : "Berat Total Kendaraan",
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };

      case 4:
        if (!axleData) {
          return {
            title: "MENDETEKSI SUMBU",
            subtitle: "Mohon Tunggu...",
            icon: (
              <div className={styles.spinnerWrapper}>
                <Spinner
                  size="huge"
                  style={{ transform: "scale(3)", color: "#60a5fa" }}
                />
              </div>
            ),
            color: "blue" as const,
          };
        }
        return {
          title: `${axleData.total_axles} SUMBU - ${axleData.total_wheels} RODA`,
          subtitle: axleData.vehicle_category,
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };

      case 5:
        if (!dimensionData) {
          return {
            title: "MENGUKUR DIMENSI",
            subtitle: "Mohon Tunggu...",
            icon: (
              <div className={styles.spinnerWrapper}>
                <Spinner
                  size="huge"
                  style={{ transform: "scale(3)", color: "#60a5fa" }}
                />
              </div>
            ),
            color: "blue" as const,
          };
        }
        return {
          title: `P: ${formatDecimal(dimensionData.length)}m L: ${formatDecimal(
            dimensionData.width
          )}m T: ${formatDecimal(dimensionData.height)}m`,
          subtitle: `Berat Total: ${formatWeight(weightData?.total_weight)} kg`,
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };

      case 6:
        if (!violationResult) {
          return {
            title: "DATA SEDANG DIPROSES",
            subtitle: "Menunggu data tambahan dan analisis akhir",
            icon: (
              <div className={styles.spinnerWrapper}>
                <Spinner
                  size="huge"
                  style={{ transform: "scale(3)", color: "#60a5fa" }}
                />
              </div>
            ),
            color: "blue" as const,
          };
        }

        if (violationResult === "Normal") {
          return {
            title: "KENDARAAN NORMAL",
            subtitle: "Silakan Lanjutkan Perjalanan",
            icon: (
              <CheckmarkCircle24Filled
                style={{ fontSize: "160px", color: "#34d399" }}
              />
            ),
            color: "green" as const,
          };
        }

        return {
          title: "PELANGGARAN TERDETEKSI",
          subtitle: violationResult,
          icon: (
            <Warning24Filled style={{ fontSize: "160px", color: "#f87171" }} />
          ),
          color: "red" as const,
        };

      default:
        return {
          title: "SISTEM SIAP",
          subtitle: "",
          icon: (
            <CheckmarkCircle24Filled
              style={{ fontSize: "128px", color: "#34d399" }}
            />
          ),
          color: "green" as const,
        };
    }
  };

  const content = getDisplayContent();

  return (
    <div className={styles.container}>
      {showEnterFullscreen && (
        <button
          type="button"
          className={styles.enterButton}
          onClick={onEnterFullscreen}
        >
          Mode Fullscreen
        </button>
      )}
      {showExitFullscreen && (
        <button
          type="button"
          className={styles.exitButton}
          onClick={onExitFullscreen}
          aria-label="Keluar fullscreen"
        >
          X
        </button>
      )}
      <div style={{ width: "100%", maxWidth: "1800px" }}>
        {/* Main LED Screen */}
        <div className={styles.ledFrame}>
          {/* LED Grid Background */}
          <div className={styles.ledGrid} />

          {/* Content */}
          <div className={styles.contentWrapper}>
            {/* Icon */}
            <div className={styles.iconWrapper}>{content.icon}</div>

            {/* Main Title */}
            <div>
              <p
                className={`${styles.mainTitle} ${
                  content.color === "green"
                    ? styles.titleGreenGlow
                    : content.color === "blue"
                    ? styles.titleBlueGlow
                    : styles.titleRedGlow
                }`}
              >
                {content.title}
              </p>
            </div>

            {/* Subtitle */}
            {content.subtitle && (
              <div>
                <p
                  className={`${styles.subtitle} ${
                    content.color === "green"
                      ? styles.subtitleGreen
                      : content.color === "blue"
                      ? styles.subtitleBlue
                      : styles.subtitleRed
                  }`}
                >
                  {content.subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Glow */}
          <div
            className={`${styles.bottomGlow} ${
              content.color === "green"
                ? styles.bottomGlowGreen
                : content.color === "blue"
                ? styles.bottomGlowBlue
                : styles.bottomGlowRed
            }`}
          />
        </div>

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {steps.map((step) => (
            <div
              key={step.id}
              className={`${styles.stepDot} ${
                step.status === "active"
                  ? content.color === "green"
                    ? styles.stepDotActive
                    : content.color === "blue"
                    ? styles.stepDotActive
                    : styles.stepDotActive
                  : step.status === "completed"
                  ? styles.stepDotCompleted
                  : styles.stepDotWaiting
              }`}
              style={{
                backgroundColor:
                  step.status === "active"
                    ? content.color === "green"
                      ? "#34d399"
                      : content.color === "blue"
                      ? "#60a5fa"
                      : "#f87171"
                    : undefined,
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
