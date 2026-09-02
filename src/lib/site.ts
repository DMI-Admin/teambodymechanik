/**
 * Single source of truth for copy and links, so the full site can reuse it
 * when it replaces this holding page.
 */
export const site = {
  name: "Team BodyMechanik",
  headline: "Currently Bulking",
  tagline: "Something powerful is in the works.",
  intro: [
    "We're building the ultimate experience",
    "to help you transform your body, mind and life.",
  ],
  creed: ["Discipline", "Consistency", "Transformation"],
  url: "https://www.teambodymechanik.com",
  urlLabel: "www.teambodymechanik.com",
  coaches: [
    { name: "Coach Krish", handle: "@Coach_krish_x", href: "https://www.instagram.com/coach_krish_x/" },
    { name: "Coach Nicky", handle: "@TeamBodyMechanik", href: "https://www.instagram.com/teambodymechanik/" },
  ],
  socials: [
    { handle: "@TeamBodyMechanik", href: "https://www.instagram.com/teambodymechanik/" },
    { handle: "@Coach_krish_x", href: "https://www.instagram.com/coach_krish_x/" },
  ],
  contact: {
    eyebrow: "Want to work with us?",
    blurb: "Send a message and we'll be in touch.",
    cta: "Contact Us",
    title: "Get In Touch",
    intro: "Tell us about your goals and we'll come back to you personally.",
  },
  pillars: [
    { icon: "dumbbell", line1: "Personalised", line2: "Coaching" },
    { icon: "fuel", line1: "Nutrition", line2: "That Fuels" },
    { icon: "results", line1: "Results", line2: "That Last" },
    { icon: "community", line1: "A Community", line2: "That Raises You" },
  ],
} as const;

export type PillarIcon = (typeof site.pillars)[number]["icon"];
