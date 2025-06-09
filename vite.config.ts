import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./client/src', import.meta.url)),
      "@shared": fileURLToPath(new URL('./shared', import.meta.url)),
      "@assets": fileURLToPath(new URL("attached_assets", import.meta.url)),
    },
  },
  root: fileURLToPath(new URL("client", import.meta.url)),
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('client/index.html', import.meta.url))
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
