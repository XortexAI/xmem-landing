import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          //  Three.js ecosystem 
          // three + @react-three/fiber + @react-three/drei = ~500 KB combined
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three")
          ) {
            return "vendor-three";
          }

          // Framer Motion 
          if (
            id.includes("node_modules/framer-motion")
          ) {
            return "vendor-motion";
          }

          //  Recharts 
          // recharts pulls in d3-* sub-packages; group them together
          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/victory-vendor")
          ) {
            return "vendor-charts";
          }

          //  Radix UI
          // You have 25 @radix-ui packages — one shared chunk beats 25 tiny ones
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }

          // React core 
          // Ultra-stable; isolate so it never re-downloads
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "vendor-react";
          }

          //  TanStack Query 
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-query";
          }

          //  Form & validation stack 
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform") ||
            id.includes("node_modules/zod")
          ) {
            return "vendor-forms";
          }

          // All remaining node_modules
          // lucide-react, wouter, clsx, date-fns, jwt-decode, etc.
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
