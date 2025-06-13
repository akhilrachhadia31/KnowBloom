import React, { useRef } from "react";
import { BookOpen, Leaf } from "lucide-react";

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

  // This function serializes the logo container as an SVG + foreignObject,
  // then draws it onto a <canvas> and triggers a PNG download.
  const downloadViaSVG = () => {
    if (!logoRef.current) return;
    const node = logoRef.current;
    const { width, height } = node.getBoundingClientRect();

    // 1) Serialize the DOM node
    const serialized = new XMLSerializer().serializeToString(node);

    // 2) Wrap it in an <svg><foreignObject>...
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          ${serialized}
        </foreignObject>
      </svg>
    `;

    // 3) Create a blob URL for that SVG
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      // 4) Draw the image onto a canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // 5) Trigger download
      const a = document.createElement("a");
      a.download = "knowbloom-logo.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rowGap: 8,
      }}
    >
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
        }}
      >
        <div style={{ position: "relative", width: icon, height: icon }}>
          <BookOpen style={{ color: "#2563EB", width: icon, height: icon }} />
          <Leaf
            style={{
              color: "#22C55E",
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
        onClick={downloadViaSVG}
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
