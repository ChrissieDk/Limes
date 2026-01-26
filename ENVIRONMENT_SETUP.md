# Environment Configuration Setup

## 🎯 Problem Solved
This setup ensures that staging and master branches can have different API URLs without conflicts when merging.

## 📝 Environment Variables

### Required Variable
- `VITE_API_URL` - Your backend API URL (without `/api` suffix)

## 🔧 Setup Instructions

### 1. Local Development
Create a `.env` file in the project root (already gitignored):

```bash
# For staging development
VITE_API_URL=https://limes-staging.up.railway.app

# For production development (if testing prod locally)
# VITE_API_URL=https://limes-production.up.railway.app
```

### 2. Vercel Environment Variables

#### For Staging Branch:
1. Go to your Vercel project settings
2. Navigate to **Settings > Environment Variables**
3. Add the following variable for **Preview (staging branch only)**:
   - **Variable Name**: `VITE_API_URL`
   - **Value**: `https://limes-staging.up.railway.app`
   - **Environment**: Select **Preview** and specify **staging** branch

#### For Master/Production Branch:
1. Add the same variable for **Production**:
   - **Variable Name**: `VITE_API_URL`
   - **Value**: `https://limes-production.up.railway.app` (or your production URL)
   - **Environment**: Select **Production**

### 3. Vercel Configuration (Optional)
If you want different builds for different branches, you can also use `vercel.json`:

```json
{
  "env": {
    "VITE_API_URL": "https://limes-production.up.railway.app"
  }
}
```

## ✅ Benefits

1. **Safe Merging**: Merge staging into master without URL conflicts
2. **Environment-Specific**: Each environment uses its correct API
3. **No Code Changes**: URLs are configured per deployment, not in code
4. **Secure**: Production always points to production API
5. **Easy Updates**: Change URLs without code commits

## 🚨 Critical Notes

- **Staging** deploys should use staging API (no real payments)
- **Production** deploys should use production API (real payments)
- Never commit `.env` files (already in `.gitignore`)
- Always verify which API URL is being used in each environment

## 🧪 Testing

To verify which URL is being used:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
```

## 📋 Fallback Behavior

If `VITE_API_URL` is not set, the code defaults to:
- **Production builds**: `https://limes-staging.up.railway.app` (safe default)
- **Local dev**: Uses Vite proxy to `/api`

**Important**: Always set this variable in Vercel to avoid using wrong API!
