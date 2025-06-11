import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/", // important for correct asset paths on Render
  server: {
    historyApiFallback: true, // fallback for SPA routing on dev server
  },
});
