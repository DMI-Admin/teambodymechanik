# Team BodyMechanik — Coming Soon

Animated, responsive holding page built with Next.js (App Router), React 19 and
Tailwind CSS v4. It recreates the "Currently Bulking" poster as live DOM — real
text, real form, real links — instead of one 2.6 MB screenshot with invisible
click targets over it.

```bash
npm install
npm run dev              # http://localhost:3000
npm run build && npm start

npm run build:standalone # self-contained bundle for the server
```

Hosting on sPanel? See **[DEPLOY.md](DEPLOY.md)**.

## Layout approach

Type and spacing are written as `clamp(min, min(<vw>, <vh>), max)`.

On a phone the viewport is tall relative to its width, so the **vw** term wins
and everything scales the way you'd expect. On a desktop the **vh** term takes
over and the whole composition shrinks to fit a single screen — which is what
keeps the signup form above the fold instead of pushing it off the bottom.

Verified to fit one viewport at 1280×800, 1366×768, 1440×900, 1512×982,
1536×960, 1728×1117, 1920×1080, and 390×844 / 414×896 on mobile. Smaller
phones (360×800, 375×667) scroll slightly, which is normal.

## Artwork

The original poster was a single flat PNG. Three assets were cut from it:

| File | What it is |
| --- | --- |
| `public/figures.png` | The gold couple, with the black ground keyed out into a real alpha channel so `drop-shadow` hugs the silhouette rather than a rectangle |
| `public/gym-left.jpg`, `public/gym-right.jpg` | Dumbbell rack and weight plates, used as ambient side texture |
| `public/og.jpg` | Social preview image |

Everything else — the nameplate, the headline, the creed panel, the four
pillars, the form, the footer — is markup and CSS, so it reflows, scales and
stays selectable and accessible.

## Contact form

The plate under the pillars opens a modal contact form (name, email, optional
phone, message). It's a native `<dialog>` driven by `showModal()`, so the focus
trap, Escape-to-close and background inertness come from the browser rather than
hand-rolled JS.

`POST /api/contact` validates the submission, then sends a notification email
through [Resend](https://resend.com). The sender's address is set as `Reply-To`,
so replying from your inbox goes straight back to them.

Copy `.env.example` to `.env.local` and fill in three values:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@teambodymechanik.com
CONTACT_FROM_EMAIL="Team BodyMechanik <noreply@teambodymechanik.com>"
```

`CONTACT_FROM_EMAIL` must use a domain verified in
[Resend](https://resend.com/domains). To test before verifying one, Resend
allows `onboarding@resend.dev` as the sender.

Without these set, the endpoint returns 503 and the form tells the visitor to
reach out on Instagram instead — it never silently swallows a message.

Spam handling: a honeypot field, length caps on every field, CRLF stripping so
values can't inject email headers, HTML escaping in the email body, and a
best-effort 5-per-10-minutes-per-IP throttle. That throttle is in-process, so it
resets on redeploy and doesn't coordinate across instances — add a real rate
limiter or a CAPTCHA if the page starts attracting spam.

## Editing copy and links

All text, coach names, social handles and the four pillars live in
[`src/lib/site.ts`](src/lib/site.ts) — one file, no hunting through JSX. The
full site can import the same module when it replaces this page.

## Motion

Staggered entrance reveals, a shine that sweeps the metallic headline, floating
figures, rising embers, a breathing glow, film grain, and hover states on the
pillars, button and links.

All of it collapses under `prefers-reduced-motion: reduce` — the composition
stays identical, the movement stops.

## Notes

- `index.html` is the original poster page, kept for reference. It is not part
  of the build and is not served.
