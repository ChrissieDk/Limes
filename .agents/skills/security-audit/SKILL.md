---
name: security-audit
description: Systematic security review across authentication, input validation, secrets management, data protection, and dependencies. Use when reviewing code for security, auditing auth flows, checking for injection vulnerabilities, verifying secrets handling, or assessing security posture.
---

# Security Audit

## The Iron Law

Security is not a feature you add later. It is a property you verify now. Every unchecked input, every hardcoded secret, every missing auth check is a vulnerability waiting for an attacker.

---

## The Five Fortresses

### Fortress 1: Authentication & Authorization

- [ ] Auth enforced on all endpoints (no gaps)
- [ ] Password requirements adequate (length, complexity)
- [ ] Session/token management secure (httponly, secure flags, expiry)
- [ ] Role-based access control implemented and enforced
- [ ] Privilege escalation paths blocked
- [ ] MFA for sensitive operations
- [ ] Password reset secure (no enumeration, token expiry)

### Fortress 2: Input Validation & Injection

- [ ] All user inputs validated (type, length, range, format)
- [ ] SQL parameterized (never concatenated)
- [ ] No eval() or equivalent on user input
- [ ] Command injection prevented (no shell exec with user input)
- [ ] XSS prevented (output encoding, CSP headers)
- [ ] Path traversal blocked
- [ ] SSRF protection (validate URLs, whitelist domains)

### Fortress 3: Secrets & Configuration

- [ ] No secrets in code (passwords, tokens, keys)
- [ ] Environment variables for sensitive config
- [ ] .env files in .gitignore
- [ ] No sensitive data in logs
- [ ] Database credentials not hardcoded
- [ ] API keys scoped to minimum permissions

### Fortress 4: Data Protection

- [ ] PII encrypted at rest
- [ ] Sensitive data encrypted in transit (TLS)
- [ ] Proper key management
- [ ] Data retention policies defined
- [ ] Privacy compliance considered

### Fortress 5: Dependency Security

- [ ] Dependencies scanned for known vulnerabilities
- [ ] No deprecated/unmaintained packages
- [ ] Lock files committed
- [ ] Minimal dependency principle

---

## The Protocol

### 1. Scope
Define audit boundary: codebase, infrastructure, dependencies, or all.

### 2. Scan
Run available security scanners (SAST, dependency check, secret scan).

### 3. Manual Review
Walk the five fortresses. Focus areas:
- Entry points (APIs, webhooks, file uploads)
- Authentication flows (login, signup, password reset)
- Authorization checks (role middleware, permission gates)
- Data access patterns (ORM usage, raw queries)
- External calls (APIs, webhooks, redirects)

### 4. Report

```markdown
# Security Audit

## Summary
Critical: N | High: N | Medium: N | Low: N

## Critical Findings
1. [CWE-ID] Title
   Location: file.js:42
   Issue: Description
   Fix: Specific remediation

## Recommendations
Priority-ordered with effort estimates.
```

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| "We'll secure it later" | Security debt compounds | Audit now, fix critical immediately |
| Trust internal inputs | Insider threats, SSRF | Validate ALL inputs |
| Hardcoded secrets | Visible in git history | Environment variables only |
| No dependency scanning | Supply chain attacks | Automated scanning |

---

## Field Notes

- The five fortresses are a checklist, not a guarantee. Think like an attacker.
- Input validation is your first and last line of defense. Never skip it.
- Secrets in code are permanent. Even if removed from HEAD, they remain in git history.
- A dependency with a known CVE is a known attack path. Patch or replace.
