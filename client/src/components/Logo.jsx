import React, { useRef } from "react";
import { BookOpen, Leaf } from "lucide-react";
import html2canvas from "html2canvas";

const sizeClasses = {
  sm: { icon: "24px", text: "16px", spacing: "8px" },
  md: { icon: "32px", text: "20px", spacing: "12px" },
  lg: { icon: "48px", text: "24px", spacing: "16px" },
  xl: { icon: "64px", text: "32px", spacing: "20px" },
};

const getLeafSize = (iconSize) => {
  if (iconSize === "24px") return "16px";
  if (iconSize === "32px") return "20px";
  if (iconSize === "48px") return "28px";
  return "36px";
};

const Logo = ({
  size = "md",
  variant = "horizontal",
  showText = true,
  className = "",
}) => {
  const currentSize = sizeClasses[size] || sizeClasses.md;
  const isStacked = variant === "stacked";
  const logoRef = useRef(null);

  const downloadImage = async () => {
    try {
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "knowbloom-logo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Canvas generation failed:", err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        ref={logoRef}
        className={className}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: isStacked ? "column" : "row",
          alignItems: "center",
          gap: currentSize.spacing,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "relative" }}>
          <BookOpen
            style={{
              color: "#2563EB", // Tailwind blue-600
              width: currentSize.icon,
              height: currentSize.icon,
            }}
          />
          <Leaf
            style={{
              color: "#22C55E", // Tailwind green-500
              width: getLeafSize(currentSize.icon),
              height: getLeafSize(currentSize.icon),
              position: "absolute",
              top: "-6px",
              right: "-6px",
              transform: "rotate(12deg)",
            }}
          />
        </div>
        {showText && (
          <div style={{ fontSize: currentSize.text, fontWeight: "bold" }}>
            <span style={{ color: "#1D4ED8" }}>Know</span>
            <span style={{ color: "#16A34A" }}>Bloom</span>
          </div>
        )}
      </div>

      <button
        onClick={downloadImage}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          backgroundColor: "#2563EB",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Download Logo
      </button>
    </div>
  );
};

export default Logo;
