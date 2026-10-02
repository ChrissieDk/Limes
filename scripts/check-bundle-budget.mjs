import { readFile } from 'node:fs/promises'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'

const gzipAsync = promisify(gzip)
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8').catch(() => '{}'))
const entry = manifest['index.html']
const assetPaths = entry ? [entry.file, ...(entry.css ?? [])] : []

if (assetPaths.length === 0) {
  throw new Error('Bundle budget could not find the Vite entry manifest; enable build.manifest.')
}

const budgets = [
  { label: 'initial JavaScript', extension: '.js', maximumBytes: 350 * 1024 },
  { label: 'initial CSS', extension: '.css', maximumBytes: 20 * 1024 },
]

for (const budget of budgets) {
  const paths = assetPaths.filter((path) => path.endsWith(budget.extension))
  const bytes = await Promise.all(paths.map(async (path) => gzipAsync(await readFile(`dist/${path}`))))
  const total = bytes.reduce((sum, value) => sum + value.length, 0)
  const formatted = `${(total / 1024).toFixed(2)} KiB gzipped`
  console.log(`${budget.label}: ${formatted} (budget ${(budget.maximumBytes / 1024).toFixed(0)} KiB)`)

  if (total > budget.maximumBytes) {
    throw new Error(`${budget.label} exceeds its budget: ${formatted}`)
  }
}
