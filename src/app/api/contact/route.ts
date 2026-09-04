import { NextResponse } from "next/server";
import { site } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = { name: 100, email: 254, phone: 40, message: 4000 } as const;

/**
 * Best-effort throttle: 5 submissions per IP per 10 minutes.
 *
 * This lives in module memory, so it resets on redeploy and is per-instance
 * rather than global. It deters casual abuse; put a real rate limiter or a
 * CAPTCHA in front if this page starts attracting spam.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) hits.clear(); // crude guard against unbounded growth
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Submissions are attacker-controlled — escape before embedding in the email. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF so a submitted value can't inject extra email headers. */
function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

type Payload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

function buildEmail({ name, email, phone, message }: Payload) {
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
  ];

  const html = `
<div style="margin:0;padding:24px;background:#0b0907;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#12100c;border:1px solid #3a2606;border-radius:8px;overflow:hidden;">
    <div style="padding:18px 24px;background:#191309;border-bottom:1px solid #3a2606;">
      <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#e0a62b;">
        ${escapeHtml(site.name)} — New enquiry
      </p>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows
        .map(
          ([label, value]) => `
      <tr>
        <td style="padding:12px 24px;border-bottom:1px solid #241a08;color:#9c8a63;font-size:12px;letter-spacing:.12em;text-transform:uppercase;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:12px 24px;border-bottom:1px solid #241a08;color:#f4e7c8;font-size:15px;">${escapeHtml(value)}</td>
      </tr>`,
        )
        .join("")}
      <tr>
        <td style="padding:16px 24px;color:#9c8a63;font-size:12px;letter-spacing:.12em;text-transform:uppercase;vertical-align:top;">Message</td>
        <td style="padding:16px 24px;color:#f4e7c8;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>
    <div style="padding:14px 24px;background:#0e0b07;border-top:1px solid #241a08;">
      <p style="margin:0;color:#7a6b4c;font-size:12px;">Reply directly to this email to reach ${escapeHtml(name)}.</p>
    </div>
  </div>
</div>`.trim();

  const text = [
    `${site.name} — new enquiry`,
    "",
    `Name:  ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  return { html, text };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled in => bot. Answer as if it worked, send nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ message: "Message sent. We'll be in touch." });
  }

  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { message: "That's a few messages already — please try again a little later." },
      { status: 429 },
    );
  }

  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");

  const name = singleLine(str("name"));
  const email = singleLine(str("email")).toLowerCase();
  const phone = singleLine(str("phone"));
  const message = str("message");

  if (
    !name ||
    name.length > LIMITS.name ||
    !EMAIL_RE.test(email) ||
    email.length > LIMITS.email ||
    phone.length > LIMITS.phone ||
    !message ||
    message.length > LIMITS.message
  ) {
    return NextResponse.json({ message: "Please check your details and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error(
      "[contact] Missing config. Set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL.",
    );
    return NextResponse.json(
      { message: "The contact form isn't configured yet. Please reach us on Instagram." },
      { status: 503 },
    );
  }

  const { html, text } = buildEmail({ name, email, phone, message });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        reply_to: email,
        subject: `New enquiry from ${name} — ${site.name}`,
        html,
        text,
      }),
      // Route handlers run through Next's instrumented fetch. Opt out of any
      // caching so this is always a live request.
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const payload = (await res.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!res.ok) {
      console.error("[contact] Resend returned HTTP", res.status, payload);
      return NextResponse.json(
        { message: "We couldn't send that just now. Please try again shortly." },
        { status: 502 },
      );
    }

    console.info("[contact] sent", payload?.id);
  } catch (error) {
    // undici buries the real reason in `cause` — surface it, or this is undebuggable.
    const err = error as Error & { cause?: unknown };
    console.error("[contact] send threw:", err?.name, err?.message, "| cause:", err?.cause);
    return NextResponse.json(
      { message: "We couldn't send that just now. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Message sent. We'll be in touch." });
}
