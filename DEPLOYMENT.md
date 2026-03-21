# Deployment Guide (Netlify & Vercel)

## Environment Variables (Required)

Before deploying, configure these in your hosting dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |

**Netlify:** Site settings → Environment variables  
**Vercel:** Project settings → Environment Variables

If these are missing, the app will show a login page but authentication will fail with a clear error.

## Database Setup

1. Run the schema: `supabase/schema.sql` (includes new RLS policies for thesis submissions)
2. Create the `thesis_payloads` storage bucket in Supabase if using thesis uploads
3. Configure Supabase Auth → URL Configuration:
   - Site URL: your production URL
   - Redirect URLs: add `https://yourdomain.com/reset-password` for password reset

## SPA Routing

Both Netlify and Vercel are configured for client-side routing:
- `vercel.json` – rewrites all routes to `index.html`
- `netlify.toml` and `public/_redirects` – same for Netlify

## Troubleshooting White Screen

If you see a white screen:
1. **Check env vars** – Ensure `VITE_SUPABASE_*` are set in the build environment
2. **Open browser console** – Look for JavaScript errors (Error Boundary will show a fallback for uncaught errors)
3. **Verify build** – Run `npm run build` locally; `dist/` should contain `index.html` and assets
4. **Clear cache** – Hard refresh (Ctrl+Shift+R) or try incognito
