import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

const isDev = import.meta.env.DEV;

// Register PWA service worker (auto-update on new version)
registerSW({ immediate: true });

// ── Sentry — disabled entirely in local development ──

if (!isDev) {
  Sentry.init({
    dsn: "https://731e046d41281156c2fa304dfdb4101d@o4511324749824000.ingest.de.sentry.io/4511324754608208",
    environment: import.meta.env.MODE || "development",
    sendDefaultPii: true,

    enableLogs: true,
    enableMetrics: true,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.feedbackIntegration({
        autoInject: false,
        colorScheme: "dark",
        showBranding: false,
        formLogo: "/images/limes-mobile_horizontal.svg",
        buttonLabel: "Report an Issue",
        submitButtonLabel: "Send Report",
        cancelButtonLabel: "Cancel",
        formTitle: "Report an Issue",
        namePlaceholder: "Your name",
        emailPlaceholder: "your.email@example.com",
        messagePlaceholder: "What went wrong? Describe the issue...",
        showName: true,
        showEmail: true,
        isNameRequired: false,
        isEmailRequired: false,
        themeLight: {
          background: "#0E0E12",
          foreground: "#ffffff",
          accentBackground: "#ABFF63",
          accentForeground: "#0E0E12",
          outline: "rgba(255, 255, 255, 0.20)",
          boxShadow: "none",
          successColor: "#2da98c",
          errorColor: "#f55459",
        },
        themeDark: {
          background: "#0E0E12",
          foreground: "#ffffff",
          accentBackground: "#ABFF63",
          accentForeground: "#0E0E12",
          outline: "rgba(255, 255, 255, 0.20)",
          boxShadow: "none",
          successColor: "#2da98c",
          errorColor: "#f55459",
        },
      }),
      Sentry.consoleLoggingIntegration({
        levels: ["log", "info", "warn", "error", "debug", "assert"],
      }),
    ],

    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      /^\//,
      /^https:\/\/limes-staging\.up\.railway\.app/,
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSendLog(log) {
      if (import.meta.env.PROD && log.level === "debug") {
        return null;
      }
      const sensitive = [
        "password",
        "token",
        "authorization",
        "secret",
        "api_key",
        "credit_card",
      ];
      if (log.attributes) {
        for (const key of Object.keys(log.attributes)) {
          if (sensitive.some((s) => key.toLowerCase().includes(s))) {
            delete log.attributes[key];
          }
        }
      }
      return log;
    },

    beforeSend(event) {
      if (
        import.meta.env.DEV &&
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        return null;
      }
      if (event.breadcrumbs) {
        for (const crumb of event.breadcrumbs) {
          if (crumb.data?.url) {
            try {
              const url = new URL(crumb.data.url);
              url.search = "";
              crumb.data.url = url.toString();
            } catch {
              // ignore malformed URLs
            }
          }
          if (crumb.data?.headers?.Authorization) {
            delete crumb.data.headers.Authorization;
          }
        }
      }
      return event;
    },
  });

  Sentry.getGlobalScope().setAttributes({
    app_name: "limes",
    platform: "web",
  });
}

// Sentry Feedback widget custom styles (production only)
if (!isDev && typeof window !== "undefined") {
  const injectFeedbackStyles = () => {
    const host = document.getElementById("sentry-feedback");
    if (!host || !host.shadowRoot) return false;

    const style = document.createElement("style");
    style.textContent = `
      textarea,
      input[type="text"],
      input[type="email"] {
        background: #1F1E24 !important;
        border: 1px solid rgba(255, 255, 255, 0.20) !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        font-family: 'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
      }
      textarea::placeholder,
      input::placeholder {
        color: rgba(255, 255, 255, 0.40) !important;
      }
      textarea:focus,
      input:focus {
        border-color: rgba(171, 255, 99, 0.50) !important;
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(171, 255, 99, 0.15) !important;
      }
    `;
    host.shadowRoot.appendChild(style);
    return true;
  };

  if (!injectFeedbackStyles()) {
    const observer = new MutationObserver(() => {
      if (injectFeedbackStyles()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// React 19 root
const root = createRoot(document.getElementById("root")!, {
  ...(isDev
    ? {}
    : {
        onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
          console.warn("Uncaught error", error, errorInfo.componentStack);
        }),
        onCaughtError: Sentry.reactErrorHandler(),
        onRecoverableError: Sentry.reactErrorHandler(),
      }),
});

root.render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
