import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const document = JSON.parse(await readFile(new URL('../security-exceptions.json', import.meta.url), 'utf8'))
const today = new Date().toISOString().slice(0, 10)

if (document.schemaVersion !== 1 || !Array.isArray(document.exceptions)) {
  throw new Error('security-exceptions.json has an unsupported schema')
}

for (const exception of document.exceptions) {
  for (const field of ['id', 'scope', 'severity', 'reachability', 'reason', 'owner', 'reviewDate', 'tracking']) {
    if (typeof exception[field] !== 'string' || exception[field].trim() === '') {
      throw new Error(`Security exception is missing required field: ${field}`)
    }
  }

  if (!Array.isArray(exception.packages) || exception.packages.length === 0) {
    throw new Error(`Security exception ${exception.id} must list affected packages`)
  }

  if (exception.reviewDate < today) {
    throw new Error(`Security exception ${exception.id} expired on ${exception.reviewDate}`)
  }
}

const scopes = [
  { name: 'root production dependencies', cwd: repositoryRoot },
  { name: 'Firebase Functions production dependencies', cwd: `${repositoryRoot}/functions` },
]

for (const scope of scopes) {
  const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
    cwd: scope.cwd,
    encoding: 'utf8',
    maxBuffer: 20_000_000,
  })

  if (!audit.stdout) {
    throw new Error(`npm audit produced no JSON for ${scope.name}: ${audit.stderr || 'unknown error'}`)
  }

  const report = JSON.parse(audit.stdout)
  const findings = Object.entries(report.vulnerabilities ?? {})
    .filter(([, vulnerability]) => ['high', 'critical'].includes(vulnerability.severity))
    .map(([packageName]) => packageName)

  const allowed = new Set(
    document.exceptions
      .filter((exception) => exception.scope === scope.name)
      .flatMap((exception) => exception.packages),
  )
  const unrecognized = findings.filter((packageName) => !allowed.has(packageName))

  if (unrecognized.length > 0) {
    throw new Error(`Unrecognized high/critical ${scope.name} findings: ${unrecognized.join(', ')}`)
  }

  console.log(`${scope.name}: ${findings.length} known high/critical package findings are covered by unexpired exceptions.`)
}

console.log(`Validated ${document.exceptions.length} security exceptions; next review is required by ${document.exceptions.map((item) => item.reviewDate).sort()[0]}.`)
