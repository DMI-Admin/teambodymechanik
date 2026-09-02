import type { PillarIcon } from "@/lib/site";

/** Line-art icons matching the four pillars on the poster. */
const PILLAR_PATHS: Record<PillarIcon, React.ReactNode> = {
  dumbbell: (
    <>
      <path d="M2.8 9.5v5M6 7v10M18 7v10M21.2 9.5v5" />
      <path d="M6 12h12" />
    </>
  ),
  fuel: (
    <>
      <path d="M7 3v6.2a2.1 2.1 0 0 0 4.2 0V3" />
      <path d="M9.1 11.3V21" />
      <path d="M17.4 3c1.4 1.8 1.9 4 1.9 6 0 1.7-.7 2.9-1.9 3.3V21" />
    </>
  ),
  results: (
    <>
      <path d="M3.5 20.2h17" />
      <path d="M7 20.2v-4.4M12 20.2v-7.2M17 20.2v-5.6" />
      <path d="m5.6 10.2 4.3-4.1 3.3 2.7 5.4-5" />
      <path d="M15.4 3.8h3.2V7" />
    </>
  ),
  community: (
    <>
      <path d="M3.6 17.6 2.9 7.1l5.3 4.1L12 4.5l3.8 6.7 5.3-4.1-.7 10.5z" />
      <path d="M4.2 20.4h15.6" />
    </>
  ),
};

export function PillarGlyph({ name }: { name: PillarIcon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {PILLAR_PATHS[name]}
    </svg>
  );
}

export function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.5 6.8 8.5 6 8.5-6" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}
