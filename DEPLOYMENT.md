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
2. Run migrations: `supabase db push` (or run `supabase/migrations/*.sql` manually)
   - `20250321100000_thesis_storage.sql` creates the `thesis_payloads` bucket and storage RLS
3. **If thesis uploads fail:** Create the bucket manually in Supabase Dashboard:
   - Storage → New bucket → Name: `thesis_payloads`, Public: ON, File size limit: 50 MB
   - Add RLS policies from the migration file (see `supabase/migrations/20250321100000_thesis_storage.sql`)
4. Configure Supabase Auth → URL Configuration:
   - Site URL: your production URL
   - Redirect URLs: add `https://yourdomain.com/reset-password` for password reset

## SPA Routing

Both Netlify and Vercel are configured for client-side routing:
- `vercel.json` – rewrites all routes to `index.html`
- `netlify.toml` and `public/_redirects` – same for Netlify

## Troubleshooting Thesis Upload

If thesis submission fails:
1. **"Student profile required"** – Sign in with a registered student account (not simulation/demo).
2. **"Storage bucket not set up"** – Run `supabase/migrations/20250321100000_thesis_storage.sql` or create the bucket manually in Supabase Dashboard.
3. **"Permission denied"** – Ensure the user has a `students` record linked via `user_id`.
4. **Check browser console** – Errors are logged with `[SubmitThesis]` prefix.
5. **Verify storage policies** – Students must be able to INSERT into `storage.objects` where the path starts with their `student.id`.

## Troubleshooting White Screen

If you see a white screen:
1. **Check env vars** – Ensure `VITE_SUPABASE_*` are set in the build environment
2. **Open browser console** – Look for JavaScript errors (Error Boundary will show a fallback for uncaught errors)
3. **Verify build** – Run `npm run build` locally; `dist/` should contain `index.html` and assets
4. **Clear cache** – Hard refresh (Ctrl+Shift+R) or try incognito
