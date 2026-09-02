"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, CloseIcon, EnvelopeIcon } from "./icons";
import { site } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The poster's signup plate, but the button opens a contact dialog instead of
 * collecting an email inline.
 *
 * Built on native <dialog> + showModal(), which gives us the focus trap, Escape
 * handling, background inertness and the ::backdrop pseudo-element for free.
 */
export default function ContactDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const ids = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function open() {
    dialogRef.current?.showModal();
    // showModal() blocks interaction but not scrolling — lock the page behind it.
    document.documentElement.style.overflow = "hidden";
  }

  function close() {
    dialogRef.current?.close();
  }

  // Fires for Escape and form dismissal as well as our own close button.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => {
      document.documentElement.style.overflow = "";
      // Reset after the exit transition so the form doesn't visibly snap back.
      window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
        setErrors({});
        formRef.current?.reset();
      }, 350);
    };

    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("close", onClose);
      document.documentElement.style.overflow = "";
    };
  }, []);

  /** Clicking the backdrop closes; clicking the panel must not. */
  function onDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) close();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const body = String(data.get("message") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Please tell us your name.";
    if (!EMAIL_RE.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (!body) nextErrors.message = "Please add a short message.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: body,
          // Honeypot: bots fill it, humans never see it.
          company: String(data.get("company") ?? ""),
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(payload.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.message ?? "Message sent. We'll be in touch.");
    } catch {
      setStatus("error");
      setMessage("Network hiccup — please try again in a moment.");
    }
  }

  const invalid = (field: keyof FieldErrors) => (errors[field] ? true : undefined);

  return (
    <div className="w-full max-w-[640px]">
      {/* Trigger — keeps the poster's framed plate */}
      <div className="plate">
        <div className="plate-inner flex flex-col gap-3 px-3 py-[clamp(0.5rem,1.3vh,0.8rem)] sm:flex-row sm:items-center sm:gap-4 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <EnvelopeIcon className="size-[clamp(1.5rem,4.6vh,1.9rem)] shrink-0 text-gold-300" />
            <div className="min-w-0 flex-1 text-left">
              <p className="font-display text-[clamp(0.66rem,min(2.5vw,1.65vh),0.86rem)] leading-tight tracking-[0.06em] text-gold-100 uppercase">
                {site.contact.eyebrow}
              </p>
              <p className="mt-0.5 text-[clamp(0.72rem,min(2.4vw,1.6vh),0.88rem)] text-gold-200/60">
                {site.contact.blurb}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={open}
            className="btn-gold w-full px-6 py-[clamp(0.5rem,1.7vh,0.8rem)] text-[clamp(0.82rem,min(2.9vw,1.95vh),1rem)] sm:w-auto sm:shrink-0"
          >
            {site.contact.cta}
          </button>
        </div>
      </div>

      {/* Dialog */}
      <dialog ref={dialogRef} className="dialog" onClick={onDialogClick} aria-labelledby={`${ids}-title`}>
        <div className="dialog-panel">
          <button type="button" onClick={close} className="dialog-close" aria-label="Close contact form">
            <CloseIcon className="size-4" />
          </button>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <span className="grid size-14 place-items-center rounded-full border border-gold-400/60 bg-gold-400/10">
                <CheckIcon className="size-7 text-gold-200" />
              </span>
              <h2 id={`${ids}-title`} className="gold-text font-display text-2xl tracking-[0.04em] uppercase">
                Message Sent
              </h2>
              <p className="max-w-[34ch] text-sm leading-relaxed text-gold-200/80" role="status">
                {message}
              </p>
              <button type="button" onClick={close} className="btn-gold mt-2 px-7 py-2.5 text-sm">
                Close
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="px-6 pt-8 pb-7 sm:px-8">
              <h2
                id={`${ids}-title`}
                className="gold-text text-center font-display text-[clamp(1.5rem,6vw,2rem)] leading-none tracking-[0.03em] uppercase"
              >
                {site.contact.title}
              </h2>
              <p className="mx-auto mt-2.5 max-w-[38ch] text-center text-[0.86rem] leading-relaxed text-gold-200/70">
                {site.contact.intro}
              </p>

              <span className="rule mx-auto mt-5 mb-6 block w-24" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor={`${ids}-name`} className="field-label">
                    Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${ids}-name`}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="Your name"
                    className="field"
                    aria-invalid={invalid("name")}
                    aria-describedby={errors.name ? `${ids}-name-err` : undefined}
                  />
                  {errors.name && (
                    <p id={`${ids}-name-err`} className="field-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor={`${ids}-email`} className="field-label">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${ids}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                    className="field"
                    aria-invalid={invalid("email")}
                    aria-describedby={errors.email ? `${ids}-email-err` : undefined}
                  />
                  {errors.email && (
                    <p id={`${ids}-email-err`} className="field-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor={`${ids}-phone`} className="field-label">
                    Phone <span className="text-gold-200/40 normal-case">(optional)</span>
                  </label>
                  <input
                    id={`${ids}-phone`}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="+44 …"
                    className="field"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor={`${ids}-message`} className="field-label">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={`${ids}-message`}
                    name="message"
                    rows={4}
                    required
                    maxLength={4000}
                    placeholder="What are you training for?"
                    className="field resize-y"
                    aria-invalid={invalid("message")}
                    aria-describedby={errors.message ? `${ids}-message-err` : undefined}
                  />
                  {errors.message && (
                    <p id={`${ids}-message-err`} className="field-error">
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Honeypot — off-screen rather than display:none so bots still fill it */}
              <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor={`${ids}-company`}>Company</label>
                <input id={`${ids}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-gold mt-6 w-full px-6 py-3 text-[0.95rem]"
              >
                {status === "submitting" ? "Sending…" : "Send Message"}
              </button>

              <p
                role="status"
                aria-live="polite"
                className={`mt-3 min-h-[1.2em] text-center text-[0.8rem] ${
                  status === "error" ? "text-red-300" : "text-gold-200/70"
                }`}
              >
                {message}
              </p>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
