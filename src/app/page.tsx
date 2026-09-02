import Image from "next/image";
import Backdrop from "@/components/Backdrop";
import ContactDialog from "@/components/ContactDialog";
import { GlobeIcon, InstagramIcon, PillarGlyph } from "@/components/icons";
import { site } from "@/lib/site";

/**
 * Sizes below are written as `min(<vw>, <vh>)` inside a clamp. On phones the
 * viewport is tall relative to its width so the vw term wins and type scales
 * normally; on desktop the vh term takes over and the whole poster shrinks to
 * fit one screen instead of pushing the signup form below the fold.
 */

/** Entrance stagger helper — feeds the `--d` delay used by `.reveal`. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/**
 * Hairline between pillars: down the middle of the 2x2 grid on small screens,
 * between all four once they sit in a row.
 */
function pillarDivider(index: number) {
  const onMobile = index % 2 === 1 ? "border-l border-gold-600/30" : "";
  const onDesktop = index > 0 ? "sm:border-l sm:border-gold-600/30" : "sm:border-l-0";
  return `${onMobile} ${onDesktop}`;
}

export default function Page() {
  return (
    <>
      <Backdrop />

      <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-[min(1180px,116vh)] flex-col items-center justify-center px-5 py-[clamp(0.9rem,1.6vh,2.25rem)] text-center sm:px-8">
        {/* Creed — framed plaque on wide screens, inline rule on everything else */}
        <aside
          className="reveal absolute top-[9%] left-2 hidden xl:block"
          style={d(900)}
          aria-label="Our creed"
        >
          <div className="border border-gold-600/55 p-px">
            <ul className="flex flex-col gap-3 border border-gold-600/35 px-6 py-6">
              {site.creed.map((word, i) => (
                <li key={word}>
                  {i > 0 && <span className="mx-auto mb-3 block h-px w-6 bg-gold-500/50" />}
                  <span className="block font-body text-[0.72rem] font-medium tracking-[0.3em] text-gold-300/90 uppercase">
                    {word}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <p
          className="reveal mb-[clamp(0.6rem,1.6vh,1.1rem)] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[clamp(0.58rem,min(2.1vw,1.4vh),0.72rem)] font-medium tracking-[0.26em] text-gold-300/75 uppercase xl:hidden"
          style={d(100)}
        >
          {site.creed.map((word, i) => (
            <span key={word} className="flex items-center gap-2.5">
              {i > 0 && <span className="size-[3px] rotate-45 bg-gold-500/70" />}
              {word}
            </span>
          ))}
        </p>

        {/* Figures */}
        <div className="reveal w-[clamp(195px,min(45vw,31vh),420px)]" style={d(0)}>
          <Image
            src="/figures.png"
            alt="Two gold statues of a muscular man and woman standing back to back, wearing Team BodyMechanik caps"
            width={460}
            height={301}
            priority
            className="figures"
            sizes="(max-width: 640px) 60vw, 420px"
          />
        </div>

        {/* Nameplate */}
        <div
          className="reveal -mt-[clamp(0.5rem,1.8vh,1.5rem)] w-[clamp(245px,min(60vw,43vh),520px)]"
          style={d(140)}
        >
          <div className="plate">
            <div className="plate-inner px-[clamp(0.8rem,2.4vw,1.8rem)] py-[clamp(0.35rem,0.85vh,0.7rem)]">
              <h2 className="gold-text font-display text-[clamp(1.05rem,min(4.4vw,3.1vh),2.5rem)] leading-none tracking-[0.02em] uppercase">
                {site.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="reveal gold-text mt-[clamp(0.45rem,1.2vh,1rem)] font-display text-[clamp(1.95rem,min(11.3vw,11.1vh),8.4rem)] leading-[0.92] tracking-[-0.005em] whitespace-nowrap uppercase"
          style={d(240)}
        >
          {site.headline}
        </h1>

        {/* Divider */}
        <div
          className="reveal mt-[clamp(0.45rem,1.1vh,0.9rem)] flex w-full max-w-[820px] items-center gap-3"
          style={d(360)}
        >
          <span className="rule flex-1" />
          <span className="dot-pulse size-1.5 shrink-0 bg-gold-300" />
          <span className="rule flex-1" />
        </div>

        {/* Tagline */}
        <p
          className="reveal mt-[clamp(0.45rem,1.1vh,0.9rem)] text-[clamp(0.66rem,min(2.4vw,1.7vh),1.02rem)] font-semibold tracking-[0.22em] text-[#f3ead6] uppercase sm:tracking-[0.34em]"
          style={d(420)}
        >
          {site.tagline}
        </p>

        {/* Intro */}
        <p
          className="reveal mt-[clamp(0.4rem,0.9vh,0.75rem)] max-w-[46ch] text-[clamp(0.8rem,min(2.8vw,2vh),1.1rem)] leading-relaxed text-gold-200/85"
          style={d(500)}
        >
          <span className="sm:block">{site.intro[0]} </span>
          <span className="sm:block">{site.intro[1]}</span>
        </p>

        {/* Pillars */}
        <ul
          className="reveal mt-[clamp(0.85rem,1.8vh,1.7rem)] grid w-full max-w-[760px] grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-y-0"
          style={d(580)}
        >
          {site.pillars.map((pillar, i) => (
            <li
              key={pillar.icon}
              className={`pillar flex flex-col items-center gap-[clamp(0.35rem,0.8vh,0.6rem)] px-2 ${pillarDivider(i)}`}
            >
              <span className="pillar-ring">
                <PillarGlyph name={pillar.icon} />
              </span>
              <span className="text-[clamp(0.58rem,min(2.1vw,1.4vh),0.72rem)] leading-[1.45] font-semibold tracking-[0.13em] text-[#e7d9ba] uppercase">
                {pillar.line1}
                <br />
                {pillar.line2}
              </span>
            </li>
          ))}
        </ul>

        {/* Contact */}
        <div className="reveal mt-[clamp(0.95rem,1.9vh,1.9rem)] flex w-full justify-center" style={d(680)}>
          <ContactDialog />
        </div>

        {/* Coaches */}
        <div className="reveal mt-[clamp(0.75rem,1.6vh,1.5rem)]" style={d(780)}>
          <p className="flex items-center justify-center gap-[clamp(0.6rem,2.4vw,1.4rem)] font-script text-[clamp(1.25rem,min(4.8vw,3.4vh),2.3rem)] leading-none text-gold-300">
            <span>{site.coaches[0].name}</span>
            <span aria-hidden="true" className="h-[1.1em] w-px bg-gold-600/60" />
            <span>{site.coaches[1].name}</span>
          </p>

          <p className="mt-[clamp(0.3rem,0.9vh,0.6rem)] text-[clamp(0.55rem,min(2vw,1.3vh),0.7rem)] font-medium tracking-[0.34em] text-gold-200/70 uppercase">
            {site.name}
          </p>
          <span className="rule mx-auto mt-[clamp(0.3rem,0.9vh,0.6rem)] block w-[min(300px,70vw)]" />
        </div>

        {/* Links */}
        <div className="reveal mt-[clamp(0.65rem,1.4vh,1.1rem)]" style={d(860)}>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pill px-[clamp(0.9rem,3vw,1.4rem)] py-[clamp(0.35rem,1.1vh,0.6rem)] text-[clamp(0.6rem,min(2.2vw,1.45vh),0.8rem)] font-semibold tracking-[0.14em] uppercase"
          >
            <GlobeIcon className="size-[1.05em]" />
            {site.urlLabel}
          </a>

          <div className="mt-[clamp(0.45rem,1.1vh,0.8rem)] flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {site.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[clamp(0.66rem,min(2.5vw,1.6vh),0.85rem)] text-gold-200/80 transition-colors hover:text-gold-100"
              >
                <InstagramIcon className="size-[1.15em] shrink-0" />
                {social.handle}
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
