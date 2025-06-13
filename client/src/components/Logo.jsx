// src/components/Logo.jsx
import React, { useRef } from "react";
import { BookOpen, Leaf } from "lucide-react";
import html2canvas from "html2canvas";

const sizeMap = {
  sm: { icon: 24, text: 16, gap: 8 },
  md: { icon: 32, text: 20, gap: 12 },
  lg: { icon: 48, text: 24, gap: 16 },
  xl: { icon: 64, text: 32, gap: 20 },
};
const leafSizeMap = { 24: 16, 32: 20, 48: 28, 64: 36 };

export default function Logo({
  size = "md",
  variant = "horizontal",
  showText = true,
}) {
  const { icon, text, gap } = sizeMap[size] || sizeMap.md;
  const leaf = leafSizeMap[icon];
  const isStacked = variant === "stacked";
  const logoRef = useRef();

  const download = async () => {
    try {
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement("a");
      a.download = "knowbloom-logo.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) {
      console.error("Canvas generation failed:", e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rowGap: "8px",
      }}
    >
      {/* the white rounded container */}
      <div
        ref={logoRef}
        style={{
          display: "flex",
          flexDirection: isStacked ? "column" : "row",
          alignItems: "center",
          columnGap: `${gap}px`,
          backgroundColor: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
          // strip out any filters/shadows
          filter: "none",
        }}
      >
        <div style={{ position: "relative", width: icon, height: icon }}>
          <BookOpen
            style={{
              color: "#2563EB", // blue-600
              width: icon,
              height: icon,
            }}
          />
          <Leaf
            style={{
              color: "#22C55E", // green-500
              width: leaf,
              height: leaf,
              position: "absolute",
              top: -6,
              right: -6,
              transform: "rotate(12deg)",
            }}
          />
        </div>

        {showText && (
          <div style={{ fontSize: text, fontWeight: 700, display: "flex" }}>
            <span style={{ color: "#1D4ED8" }}>Know</span>
            <span style={{ color: "#16A34A" }}>Bloom</span>
          </div>
        )}
      </div>

      <button
        onClick={download}
        style={{
          padding: "6px 12px",
          backgroundColor: "#2563EB",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Download Logo
      </button>
    </div>
  );
}
