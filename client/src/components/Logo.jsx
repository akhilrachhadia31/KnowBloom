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
  return "w-9 w-9";
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
    const canvas = await html2canvas(logoRef.current, {
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = "knowbloom-logo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={logoRef}
        className={`bg-transparent flex items-center ${
          isStacked ? "flex-col" : "flex-row"
        } ${currentSize.spacing} ${className}`}
      >
        <div className="relative">
          <BookOpen
            className={`${currentSize.icon} text-blue-600 drop-shadow-sm`}
          />
          <Leaf
            className={`
              ${getLeafSize(currentSize.icon)}
              text-green-500
              absolute -top-1 -right-1
              rotate-12 drop-shadow-sm
            `}
          />
        </div>
        {showText && (
          <div
            className={`${currentSize.text} font-bold ${
              isStacked ? "text-center" : ""
            }`}
          >
            <span className="text-blue-700">Know</span>
            <span className="text-green-600">Bloom</span>
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
