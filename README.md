# Soolou

## Local setup

Create `.env.local` from `.env.example` and add:

```text
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Only the two `VITE_` values are exposed to the browser. `GEMINI_API_KEY` is read by the server function and must never use a `VITE_` prefix.

## Vercel deployment

1. Import the repository into Vercel.
2. Keep the detected framework as **Vite**. The build and output settings are already defined in `vercel.json`, and Node.js 22 is pinned in `package.json`.
3. Open **Settings > Environment Variables**.
4. Add these variables for Production, Preview, and Development:

| Name | Source | Visibility |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | Public frontend value |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon or publishable key | Public frontend value |
| `GEMINI_API_KEY` | Google AI Studio | Sensitive server-only value |

Do not add a Supabase service-role key to Vercel. The frontend uses Row Level Security with the safe anon or publishable key.

Deploy after saving the variables. Environment variable changes only apply to new deployments.

### Supabase Auth URLs

In Supabase open **Authentication > URL Configuration**:

- Set **Site URL** to the final Vercel production URL.
- Add `https://your-project.vercel.app/**` to **Redirect URLs**.
- Keep the local redirect such as `http://127.0.0.1:5173/**` for development.

This allows signup verification and email-change confirmation links to return to the deployed site.

## Gemini chatbot

The support chat calls Gemini 3.5 Flash through the `/api/soolou-chat` Vercel Function. The Gemini key stays on the server and is never added to the Vite frontend. The existing Supabase Edge Function remains available as a fallback.

### Supabase fallback

Set the secret and deploy the function from a linked Supabase project:

```powershell
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase functions deploy soolou-chat
```

For local Edge Function testing only you may add `GEMINI_API_KEY` without the `VITE_` prefix to `.env.local` and pass that file to the Supabase CLI. The deployed function still needs the Supabase secret shown above.
