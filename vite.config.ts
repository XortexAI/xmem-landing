import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function manualChunks(id: string) {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  const normalizedId = id.replace(/\\/g, "/");

  if (
    normalizedId.includes("/node_modules/react/") ||
    normalizedId.includes("/node_modules/react-dom/") ||
    normalizedId.includes("/node_modules/scheduler/") ||
    normalizedId.includes("/node_modules/use-sync-external-store/")
  ) {
    return "vendor-core";
  }

  if (
    normalizedId.includes("/node_modules/three/") ||
    normalizedId.includes("/node_modules/@react-three/") ||
    normalizedId.includes("/node_modules/three-stdlib/") ||
    normalizedId.includes("/node_modules/maath/")
  ) {
    return "vendor-three";
  }

  if (
    normalizedId.includes("/node_modules/framer-motion/") ||
    normalizedId.includes("/node_modules/motion-dom/") ||
    normalizedId.includes("/node_modules/motion-utils/")
  ) {
    return "vendor-motion";
  }

  if (
    normalizedId.includes("/node_modules/recharts/") ||
    normalizedId.includes("/node_modules/victory-vendor/") ||
    /\/node_modules\/d3-[^/]+\//.test(normalizedId)
  ) {
    return "vendor-charts";
  }

  if (
    normalizedId.includes("/node_modules/@radix-ui/") ||
    normalizedId.includes("/node_modules/@floating-ui/")
  ) {
    return "vendor-radix";
  }

  return undefined;
}

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
        // Keep React plus its small runtime deps together and avoid a catch-all
        // vendor chunk. The previous split isolated React while another broad
        // vendor chunk imported back into it, causing a production init cycle.
        manualChunks,
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
