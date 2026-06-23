import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadSentryEnv(): Record<string, string> {
  try {
    const content = readFileSync(
      resolve(process.cwd(), ".env.sentry-build-plugin"),
      "utf-8",
    );
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
    return env;
  } catch {
    return {};
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "https://limes-staging.up.railway.app";
  const isDev = mode === "development";

  const sentryEnv = loadSentryEnv();
  const hasSentryConfig =
    sentryEnv.SENTRY_AUTH_TOKEN &&
    sentryEnv.SENTRY_ORG &&
    sentryEnv.SENTRY_PROJECT;

  return {
    base: "/",
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: {
          enabled: true,
          // In dev, suppress Workbox logs to avoid noise
          suppressWarnings: true,
        },
        includeAssets: ["favicon.svg", "images/*.png", "images/*.svg"],
        manifest: {
          name: "Limes — The Network Built Different",
          short_name: "Limes",
          description:
            "Prepaid or subscription. Build your own plan, switch in minutes, and only pay for what you actually use.",
          theme_color: "#1A1920",
          background_color: "#1A1920",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "pwa-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          // Only use offline fallback in production — in dev, assets are served from memory.
          ...(isDev ? {} : { navigateFallback: "/offline.html" }),
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-css",
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 365 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 365 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "avatars",
                expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
      react(),
      tailwindcss(),
      ...(hasSentryConfig
        ? [
            sentryVitePlugin({
              authToken: sentryEnv.SENTRY_AUTH_TOKEN,
              org: sentryEnv.SENTRY_ORG,
              project: sentryEnv.SENTRY_PROJECT,
              sourcemaps: {
                filesToDeleteAfterUpload: ["**/*.js.map"],
              },
            }),
          ]
        : []),
    ],
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      sourcemap: hasSentryConfig ? true : undefined,
    },
  };
});
