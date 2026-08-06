# GitHub Backend Setup

This app uses your GitHub repo as a shared database so that:
- **Admin** edits curriculum content → all students see it on refresh
- **Students** complete modules/checkpoints → instructor dashboard sees it
- Works across different browsers and devices (no more per-browser localStorage isolation)

## How it works

- Curriculum content lives in `content/modules.json` and `content/meta.json` in the repo.
- Each student's progress lives in `progress/<email>.json` in the repo.
- The app reads/writes these files via the GitHub REST API using a Personal Access Token (PAT).
- The PAT is embedded in the app bundle (visible in browser devtools), so it must be **scoped to only this repo**.

## Step 1 — Create a fine-grained PAT

1. Go to https://github.com/settings/personal-access-tokens/new
2. **Token name**: `genai-platform-app`
3. **Expiration**: pick a long one (e.g. 1 year) — you can rotate later
4. **Repository access**: Only select repositories → `sarbaniai/genai-platform`
5. **Permissions** → Repository permissions → **Contents: Read and Write** (that's the only one you need)
6. Click **Generate token** and copy it (starts with `github_pat_...`)

## Step 2 — Add the token to your local env

```bash
cd genai-platform
cp .env.example .env.local
```

Open `.env.local` and paste your token:

```
VITE_GITHUB_TOKEN=github_pat_your_real_token_here
VITE_GITHUB_OWNER=sarbaniai
VITE_GITHUB_REPO=genai-platform
VITE_GITHUB_BRANCH=main
```

`.env.local` is in `.gitignore` — it will never be committed.

## Step 3 — Add the token to Vercel (so the deployed app can use it)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable:
   - `VITE_GITHUB_TOKEN` = your token
   - `VITE_GITHUB_OWNER` = `sarbaniai`
   - `VITE_GITHUB_REPO` = `genai-platform`
   - `VITE_GITHUB_BRANCH` = `main`
3. **Redeploy** the project (Vercel → Deployments → ⋯ → Redeploy) so the new env vars are baked into the build.

## Step 4 — Verify

1. Open the deployed app, sign in as admin (password `mir-genai-2026` or Google).
2. Edit a module title in Content Admin → watch the "Publishing..." badge → "Published to all students".
3. Open the Instructor Dashboard → click **Refresh** → you'll see any students who have marked progress.
4. Sign in as a student (Google) on another browser/device → mark a module complete → go back to instructor dashboard → Refresh → the student appears.

## Security notes

- The PAT is in the client bundle. Anyone who opens devtools can extract it.
- That's why it's **fine-grained, scoped to one repo, contents-only**. Worst case: someone corrupts content/progress files — and that's fully recoverable from git history.
- If you need tighter security later, move to Supabase (server-side auth + row-level security). For a small trusted cohort, this GitHub approach is fine.

## Rate limits

- Authenticated GitHub API: 5,000 requests/hour. Plenty for a cohort of any reasonable size.
- Each student save = 1 commit. Each instructor dashboard load = 1 + N (number of students) requests.

## Troubleshooting

- **"Local only" badge in admin**: `.env.local` missing or token empty. Re-check Step 2.
- **"Publish failed" badge**: token lacks `Contents: Write`, or repo name/owner is wrong. Regenerate the PAT with the right scope.
- **Instructor dashboard shows no students**: students must sign in with Google and mark at least one module complete (progress auto-saves to GitHub ~1.5s after a change). Then click **Refresh**.
- **Students don't see admin's new content**: students need to refresh the page (content loads from GitHub on page load). CDN cache on `raw.githubusercontent.com` is not used here — the app calls the GitHub API directly, so content is fresh.
