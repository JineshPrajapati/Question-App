// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { APP_CONFIG } from "./project.config";

export default defineConfig(({ mode }) => {
  // Load env file based on current mode
  const env = process.env;
  const apiBaseUrl = env.VITE_API_BASE_URL;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
        manifest: {
          name: APP_CONFIG.appName,
          short_name: APP_CONFIG.shortName,
          theme_color: APP_CONFIG.themeColor,
          icons: [
            { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          },
          workbox: {
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
          }
      },
      ),
    ],
    base: "/",
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
