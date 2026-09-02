/**
 * Fixed atmosphere behind the page: warm pool of light, the gym rig textures
 * cropped from the original artwork, rising embers, vignette and grain.
 *
 * Ember values come from a seeded generator so the server and client render
 * identical markup — Math.random() here would trip hydration.
 */

type Ember = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  peak: number;
};

function makeEmbers(count: number): Ember[] {
  let seed = 20260902;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return Array.from({ length: count }, () => ({
    left: Math.round(next() * 1000) / 10,
    size: Math.round((1.5 + next() * 3.5) * 10) / 10,
    duration: Math.round((11 + next() * 13) * 10) / 10,
    delay: Math.round(next() * 16 * 10) / 10,
    drift: Math.round((next() * 120 - 60) * 10) / 10,
    peak: Math.round((0.25 + next() * 0.5) * 100) / 100,
  }));
}

const EMBERS = makeEmbers(22);

export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-glow" />
      <div className="backdrop-rig backdrop-rig--left" />
      <div className="backdrop-rig backdrop-rig--right" />

      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={
            {
              left: `${e.left}%`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDuration: `${e.duration}s`,
              animationDelay: `-${e.delay}s`,
              "--drift": `${e.drift}px`,
              "--peak": e.peak,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="backdrop-vignette" />
      <div className="backdrop-grain" />
    </div>
  );
}
