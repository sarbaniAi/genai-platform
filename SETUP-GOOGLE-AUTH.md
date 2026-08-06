# Setup Google Login (2 minutes, free)

This enables "Sign in with Google" on the login screen — real Gmail authentication like any modern app.

## Step 1: Create a Google OAuth Client ID

1. Go to **https://console.cloud.google.com/** (sign in with any Google account)
2. Click **Select a project** (top) → **NEW PROJECT**
   - Project name: `genai-platform`
   - Click **CREATE**
3. In the new project, open **APIs & Services** → **Credentials** (left sidebar)
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted to "Configure consent screen":
   - Click **CONFIGURE CONSENT SCREEN**
   - User type: **External** → **CREATE**
   - Fill app name: `GenAI Foundations`
   - Add your email as support email
   - Click **SAVE AND CONTINUE** through all screens (scopes: just `email` and `profile` are fine — they're pre-selected)
6. Back on **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `GenAI Web Client`
   - **Authorized JavaScript origins** — add these (one per line):
     ```
     http://localhost:5173
     https://genai-platform-five.vercel.app
     ```
   - (Add your Vercel production URL — the one you shared — and localhost for dev)
   - Click **CREATE**
7. Copy the **Client ID** (looks like `123456789-abc...apps.googleusercontent.com`)

## Step 2: Paste the Client ID into the code

Edit `src/lib/adminAuth.js` and replace:

```js
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

with your real Client ID:

```js
export const GOOGLE_CLIENT_ID = '123456789-abc...apps.googleusercontent.com';
```

## Step 3: Add authorized emails

In the same file, set who is admin and who is instructor:

```js
export const ADMIN_EMAILS = [
  'your-real-gmail@gmail.com'      // ← your Gmail
];
export const INSTRUCTOR_EMAILS = [
  'instructor1@gmail.com',         // ← any instructors
  'instructor2@gmail.com'
];
```

Anyone with a Gmail not in those lists becomes a **student** by default.

If you want a closed cohort (only allow listed emails, reject everyone else):

```js
export const CLOSED_COHORT = true;
```

## Step 4: Push and you're live

```bash
git add -A
git commit -m "Configure Google OAuth client ID and email allowlists"
git push origin main
```

Vercel auto-redeploys in ~60 seconds. The login screen now shows a real **"Sign in with Google"** button.

## How it works

1. User clicks **Sign in with Google**
2. Google popup → user picks their Gmail account
3. Google returns a verified ID token (JWT) containing their email + name
4. App decodes the email and checks it against `ADMIN_EMAILS` / `INSTRUCTOR_EMAILS`
5. Role is assigned:
   - Email in `ADMIN_EMAILS` → admin view
   - Email in `INSTRUCTOR_EMAILS` → instructor view
   - Any other Gmail → student view (or rejected if `CLOSED_COHORT = true`)
6. Session stored in `sessionStorage` — clears on tab close

## Security notes

- Google verifies the user's identity — no more typing random names
- The ID token is decoded client-side. For full security you'd verify the token signature server-side, but for this app (content edits stay in the user's own browser) the risk is minimal
- Admin/instructor emails are baked into the code — only those Gmail accounts get elevated roles
- Students can't access instructor or admin views — the buttons don't exist in their UI

## Changing passwords (instructor/admin fallback)

The password fallback still works for admin/instructor who prefer passwords:
- Admin password: `mir-genai-2026`
- Instructor password: `mir-instructor-2026`

To change, edit `src/lib/adminAuth.js` and generate a new hash:
```bash
echo -n "your-new-password" | shasum -a 256 | awk '{print $1}'
```
