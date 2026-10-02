import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadSentryEnv(): Record<string, string> {
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.sentry-build-plugin'), 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
    return env
  } catch {
    return {}
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'https://limes-staging.up.railway.app'

  const sentryEnv = loadSentryEnv()
  const hasSentryConfig =
    sentryEnv.SENTRY_AUTH_TOKEN && sentryEnv.SENTRY_ORG && sentryEnv.SENTRY_PROJECT

  return {
    // Use root as base so routing works correctly on Vercel
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      ...(hasSentryConfig
        ? [
            sentryVitePlugin({
              authToken: sentryEnv.SENTRY_AUTH_TOKEN,
              org: sentryEnv.SENTRY_ORG,
              project: sentryEnv.SENTRY_PROJECT,
              sourcemaps: {
                filesToDeleteAfterUpload: ['**/*.js.map'],
              },
            }),
          ]
        : []),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      manifest: true,
      // Sentry plugin needs source maps to upload
      sourcemap: hasSentryConfig ? true : undefined,
    },
  }
})
