import React, { useRef } from "react";
import { BookOpen, Leaf } from "lucide-react";
import html2canvas from "html2canvas";

const sizeClasses = {
  sm: { icon: "w-6 h-6", text: "text-lg", spacing: "gap-2" },
  md: { icon: "w-8 h-8", text: "text-xl", spacing: "gap-3" },
  lg: { icon: "w-12 h-12", text: "text-3xl", spacing: "gap-4" },
  xl: { icon: "w-16 h-16", text: "text-4xl", spacing: "gap-5" },
};

const getLeafSize = (icon) => {
  if (icon === "w-6 h-6") return "w-4 h-4";
  if (icon === "w-8 h-8") return "w-5 h-5";
  if (icon === "w-12 h-12") return "w-7 h-7";
  return "w-9 h-9";
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
    <div className="flex flex-col items-center gap-2">
      <div
        ref={logoRef}
        className={`flex ${isStacked ? "flex-col" : "flex-row"} items-center ${
          currentSize.spacing
        } ${className}`}
        style={{
          backgroundColor: "white", // safe fallback
          padding: "1rem",
          borderRadius: "0.5rem",
          fontFamily: "sans-serif",
        }}
      >
        <div className="relative">
          <BookOpen
            className={currentSize.icon}
            style={{ color: "#2563EB", width: "2rem", height: "2rem" }}
          />
          <Leaf
            className={getLeafSize(currentSize.icon)}
            style={{
              color: "#22C55E",
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              transform: "rotate(12deg)",
              width: "1rem",
              height: "1rem",
            }}
          />
        </div>
        {showText && (
          <div
            className={`${currentSize.text} font-bold`}
            style={{ fontSize: "1.25rem", fontWeight: "bold" }}
          >
            <span style={{ color: "#1D4ED8" }}>Know</span>
            <span style={{ color: "#16A34A" }}>Bloom</span>
          </div>
        )}
      </div>

      <button
        onClick={downloadImage}
        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download Logo
      </button>
    </div>
  );
};

export default Logo;
