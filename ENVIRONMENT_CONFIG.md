# Environment Configuration Guide

## How It Works

Vite loads environment files in this priority order (highest to lowest):

```
1. .env.local          ← Highest priority (for local dev, ignored by git)
2. .env                ← Default (tracked in git, safe staging defaults)
3. Deployment Platform ← Production (Vercel environment variables)
```

## Setup for Different Environments

### 🖥️ Local Development (You)

**What you use:** `.env.local` (already created, ignored by git)

**Current configuration:**
- API: `https://limes-staging.up.railway.app` ✅ Safe for testing
- Paystack: `pk_test_...` ✅ Test mode

**You never need to change anything!** Just run:
```bash
npm run dev
```

---

### 👥 Other Developers

**Setup once:**
1. Copy `.env.example` to `.env.local`
2. Update values if needed
3. `.env.local` is automatically ignored by git

```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

---

### 🚀 Production (Vercel)

**Configured in Vercel Dashboard:**
- Set environment variables in Vercel project settings
- These override all local .env files
- Should use:
  - `VITE_API_URL=https://limes-production.up.railway.app`
  - `VITE_PAYSTACK_KEY=pk_live_...`

---

### 🧪 Feature Branch Deployments

**When you push a branch:**
- Vercel creates a preview deployment
- **Problem:** It might use production environment variables!

**Solution:** Configure branch-specific environment variables in Vercel:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Set up different values for "Preview" deployments vs "Production"

---

## File Summary

| File | Purpose | Tracked by Git | Used When |
|------|---------|----------------|-----------|
| `.env.local` | Your local dev config | ❌ No | Local `npm run dev` |
| `.env` | Safe staging defaults | ✅ Yes | Fallback if .env.local missing |
| `.env.example` | Template for new devs | ✅ Yes | Documentation only |
| Vercel Env Vars | Production config | N/A | Vercel deployments |

---

## 🛡️ Safety Rules

✅ **SAFE for .env and .env.local:**
- Staging API URLs
- Test Paystack keys (pk_test_...)

❌ **NEVER in .env or .env.local:**
- Production API URLs
- Live Paystack keys (pk_live_...)
- Any production secrets

🔒 **Production secrets ONLY in Vercel Dashboard**

---

## Troubleshooting

### "I'm still hitting production!"
1. Check which file is loaded: Add `console.log(import.meta.env.VITE_API_URL)` in your code
2. Delete `.env.local` and recreate it
3. Restart dev server completely

### "Other devs are hitting production"
- They need to create their own `.env.local` file
- Make sure `.env` has safe staging defaults (it does now!)

### "Vercel preview deploys hit production"
- Configure preview environment variables in Vercel Dashboard
- Set `VITE_API_URL` for "Preview" deployments to staging

---

## Current Configuration ✅

**After this setup:**
- ✅ Local dev → **Staging API**
- ✅ Test payments → **Test mode**
- ✅ No accidental production writes
- ✅ No manual URL switching needed
- ✅ Safe defaults for all developers
