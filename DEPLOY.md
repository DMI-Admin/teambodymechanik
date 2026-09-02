# Deploying to sPanel

This app is **not** static — `/api/contact` runs server-side, so it needs a live
Node process. sPanel supports this: Node.js and NPM are preinstalled, and its
**NodeJS Manager** runs your app on a port in the **3000–3500** range and
proxies it to 80/443 for your domain.

The build produces a self-contained bundle at `.next/standalone` (server.js plus
a traced `node_modules`), so nothing extra needs installing at runtime.

---

## 0. Before you start

| Requirement | Notes |
| --- | --- |
| SSH access | You have this |
| Node **≥ 20.9.0** on the server | Next 16 requires it — check with `node -v` |
| Resend API key | [resend.com/api-keys](https://resend.com/api-keys) |
| A domain verified in Resend | [resend.com/domains](https://resend.com/domains) — or use `onboarding@resend.dev` to test |

---

## 1. Clone the repo on the server

```bash
ssh youruser@your-server
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/DMI-Admin/teambodymechanik.git
cd teambodymechanik
```

Keep it **outside `public_html`**. Nothing here should be served directly by
Apache — sPanel proxies to the Node process instead.

> **Private repo?** HTTPS cloning will prompt for a password that GitHub no
> longer accepts. Either create a read-only **deploy key**
> (`ssh-keygen -t ed25519 -C "spanel-deploy"`, add the `.pub` to the repo's
> Settings → Deploy keys, then clone the `git@github.com:...` URL), or clone with
> a personal access token.

---

## 2. Check the Node version

```bash
node -v
```

If it's below `v20.9.0`, pick a newer one in sPanel's NodeJS Manager, or install
via `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 22 && nvm use 22
```

---

## 3. Add your secrets

```bash
cp .env.example .env.local
nano .env.local
```

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@teambodymechanik.com
CONTACT_FROM_EMAIL="Team BodyMechanik <noreply@teambodymechanik.com>"
```

`.env.local` is gitignored — it lives only on the server.

> **The one real gotcha.** The standalone `server.js` calls
> `process.chdir(__dirname)`, so it only reads env files sitting **inside
> `.next/standalone/`** — a `.env.local` at the repo root is silently ignored and
> the contact form answers 503. `npm run build:standalone` copies it across for
> you, which is why you must create it *before* building.

---

## 4. Install and build

```bash
npm ci
npm run build:standalone
```

Two notes:

- Don't use `--omit=dev`. TypeScript and Tailwind are devDependencies and the
  build needs them.
- If the build is killed on a small VPS, cap the heap:
  `NODE_OPTIONS=--max-old-space-size=1024 npm run build:standalone`

You should see:

```
✓ copied public/ and .next/static
✓ copied env file(s): .env.local
✓ standalone package.json start script set to "node server.js"
```

Smoke-test it before wiring up the domain:

```bash
cd .next/standalone
PORT=3000 node server.js
# in another SSH session:
curl -I http://127.0.0.1:3000        # expect 200
```

`Ctrl+C` once that passes.

---

## 5. Register the app in sPanel

**sPanel → Software → NodeJS Manager → Deploy a New App**

| Field | Value |
| --- | --- |
| Application root | `/home/<youruser>/apps/teambodymechanik/.next/standalone` |
| Startup file | `server.js` |
| Port | `3000` (anything 3000–3500) |
| Domain | `teambodymechanik.com` |
| Node version | 20.9+ |

Point it at **`.next/standalone`**, not the repo root — that folder holds
`server.js`, its own `package.json` (whose `start` script the build rewrites to
`node server.js`), and the copied assets.

sPanel proxies that port to 80/443, so the site answers on your domain with no
Apache config of your own.

---

## 6. SSL

**sPanel → SSL → Let's Encrypt** and issue a certificate for the domain. Then
load `https://teambodymechanik.com` and send yourself a test message through the
contact form.

---

## Redeploying after a change

```bash
cd ~/apps/teambodymechanik
git pull
npm ci
npm run build:standalone
```

Then **Restart** the app in NodeJS Manager. `.env.local` survives `git pull`
because it's gitignored, and gets re-copied into the bundle on every build.

---

## Fallback: PM2 + Apache proxy

If the NodeJS Manager doesn't fit your setup, run it yourself:

```bash
npm i -g pm2
cd ~/apps/teambodymechanik/.next/standalone
PORT=3000 pm2 start server.js --name teambodymechanik
pm2 save
pm2 startup        # run the command it prints, to survive reboots
```

Then add a reverse proxy in sPanel's vhost editor for the domain:

```apache
ProxyPreserveHost On
ProxyPass        / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Contact form returns **503** | Env vars not visible. Confirm `.next/standalone/.env.local` exists; rebuild if not. |
| Contact form returns **502** | Env vars loaded but Resend rejected the send — bad API key, or `CONTACT_FROM_EMAIL` uses an unverified domain. Check the app log. |
| Page loads unstyled | `.next/static` wasn't copied. Re-run `npm run build:standalone`. |
| **502 from the domain** (not the form) | Node process isn't running, or the port doesn't match the one registered in NodeJS Manager. |
| Port refused | sPanel only allows **3000–3500**. |
| Build killed | Out of memory — use the `NODE_OPTIONS` cap above. |
| `next: not found` on start | The app root is pointed at the repo instead of `.next/standalone`. |

Logs live in the NodeJS Manager UI, or `pm2 logs teambodymechanik` on the
fallback path.
