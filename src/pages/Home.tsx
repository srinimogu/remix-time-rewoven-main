import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ScrollVideoHero from "@/components/ScrollVideoHero";
import watchHero from "@/assets/watch-hero.jpg";
import watchMovement from "@/assets/watch-movement.jpg";
import watchSide from "@/assets/watch-side.jpg";
import watchWrist from "@/assets/watch-wrist.jpg";
import watchDial from "@/assets/watch-dial.jpg";
import earth1996 from "@/assets/earth-1996.jpg";
import earth2026 from "@/assets/earth-2026.jpg";


export { Index as default };

/* ---------- Live counter ---------- */
const START = new Date("2024-01-01T00:00:00Z").getTime();
const CO2_PER_SEC = 12480 / ((Date.now() - START) / 1000); // tons/sec baseline
const PLASTIC_PER_SEC = CO2_PER_SEC * 100; // kg

function useLiveCounters() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);
  const secs = (now - START) / 1000;
  return {
    co2: secs * CO2_PER_SEC,
    plastic: secs * PLASTIC_PER_SEC,
    pieces: Math.floor(secs * (612 / ((Date.now() - START) / 1000))),
  };
}

function fmt(n: number, digits = 0) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

/* ---------- Nav ---------- */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#collection", label: "The Piece" },
    { href: "#process", label: "The Reverse" },
    { href: "#impact", label: "Impact" },
    { href: "#voices", label: "Voices" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[color:var(--background)]/70 border-b border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
        <a href="#top" className="serif text-xl tracking-widest">MONOCKLE</a>
        <nav className="hidden md:flex items-center gap-10 text-[13px] text-[color:var(--muted-foreground)]">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[color:var(--foreground)] transition-colors">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#reserve"
            className="hidden sm:inline-block text-[12px] tracking-[0.18em] uppercase border border-[color:var(--border)] px-4 py-2 hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
          >
            Reserve
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-[color:var(--border)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[color:var(--background)] border-l-[color:var(--border)]">
              <nav className="flex flex-col gap-6 mt-12 text-lg">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-[color:var(--foreground)] hover:text-[color:var(--gold)] transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="#reserve"
                  onClick={() => setOpen(false)}
                  className="mt-4 text-[12px] tracking-[0.18em] uppercase border border-[color:var(--border)] px-4 py-3 text-center hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
                >
                  Reserve
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


/* ---------- Reverse clock dial (SVG) ---------- */
function ReverseDial() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // Reverse: angles go the other way
  const s = t.getSeconds();
  const m = t.getMinutes() + s / 60;
  const h = (t.getHours() % 12) + m / 60;
  const secAng = -s * 6;
  const minAng = -m * 6;
  const hrAng = -h * 30;
  const nums = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <radialGradient id="dg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1a1a1c" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="195" fill="url(#dg)" stroke="var(--gold)" strokeWidth="0.5" opacity="0.9" />
      <circle cx="200" cy="200" r="180" fill="none" stroke="var(--gold)" strokeOpacity="0.25" strokeWidth="0.5" />
      {nums.map((n) => {
        // Counter-clockwise placement: 12 top, then 1 to the LEFT
        const angle = (-n * 30 - 90) * (Math.PI / 180);
        const x = 200 + Math.cos(angle) * 155;
        const y = 200 + Math.sin(angle) * 155;
        return (
          <text
            key={n}
            x={x}
            y={y + 6}
            textAnchor="middle"
            className="serif"
            fontSize="20"
            fill="var(--gold)"
            opacity="0.85"
          >
            {n}
          </text>
        );
      })}
      {/* minute ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i * 6 - 90) * (Math.PI / 180);
        const r1 = 178;
        const r2 = i % 5 === 0 ? 170 : 174;
        return (
          <line
            key={i}
            x1={200 + Math.cos(a) * r1}
            y1={200 + Math.sin(a) * r1}
            x2={200 + Math.cos(a) * r2}
            y2={200 + Math.sin(a) * r2}
            stroke="var(--gold)"
            strokeOpacity={i % 5 === 0 ? 0.6 : 0.25}
            strokeWidth="0.8"
          />
        );
      })}
      <g style={{ transform: `rotate(${hrAng}deg)`, transformOrigin: "200px 200px", transition: "transform .5s" }}>
        <line x1="200" y1="210" x2="200" y2="110" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g style={{ transform: `rotate(${minAng}deg)`, transformOrigin: "200px 200px", transition: "transform .5s" }}>
        <line x1="200" y1="215" x2="200" y2="70" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g style={{ transform: `rotate(${secAng}deg)`, transformOrigin: "200px 200px", transition: "transform .3s" }}>
        <line x1="200" y1="220" x2="200" y2="55" stroke="#F5F2ED" strokeWidth="1" strokeLinecap="round" />
      </g>
      <circle cx="200" cy="200" r="4" fill="var(--gold)" />
      <text x="200" y="270" textAnchor="middle" fontSize="8" letterSpacing="3" fill="var(--muted-foreground)">
        REVERSE HOROLOGY
      </text>
    </svg>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const counters = useLiveCounters();
  return (
    <section id="top" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 fade-up">
          <p className="eyebrow mb-8">Est. 2026 · Chapter 01 · Reverse Horlogerie</p>
          <h1 className="font-normal leading-[0.95] tracking-[-0.02em] text-[clamp(2.75rem,7vw,6rem)]">
            Engineered to<br />
            Turn <span className="serif italic text-[color:var(--gold)]">Time</span> Back.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
            World's 1st watch engineered to move against time, ticking anti-clockwise beneath sapphire glass.
            Every piece offsets 1 ton of CO₂ and removes 100kg of plastic.{" "}
            <a href="#process" className="link-blue underline underline-offset-4">See how →</a>
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#collection"
              className="group inline-flex items-center gap-3 bg-[color:var(--foreground)] text-[color:var(--primary-foreground)] px-6 py-3.5 text-[12px] tracking-[0.2em] uppercase hover:bg-[color:var(--gold)] transition-colors"
            >
              Explore Monockle Timepieces
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Live counter */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl">
            <LiveStat label="CO₂ offset · live" value={fmt(counters.co2, 2)} unit="tons" />
            <LiveStat label="Plastic removed" value={fmt(counters.plastic / 1000, 2)} unit="tonnes" />
            <LiveStat label="Owners" value={fmt(counters.pieces)} unit="pieces" />
          </div>
        </div>

        <div className="lg:col-span-5 relative aspect-square max-w-[520px] mx-auto w-full">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,#B39A67_0%,transparent_55%)] opacity-10 blur-2xl" />
          <ReverseDial />
        </div>
      </div>
    </section>
  );
}

function LiveStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="serif text-3xl md:text-4xl font-light tabular-nums text-[color:var(--foreground)]">
        {value}
        <span className="text-[11px] tracking-[0.2em] uppercase text-[color:var(--muted-foreground)] ml-2 align-middle">
          {unit}
        </span>
      </div>
      <div className="eyebrow mt-2 relative pl-4">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[color:var(--green)] animate-pulse" />
        {label}
      </div>
    </div>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const items = [
    "counter-clockwise movement",
    "1 ton CO₂ offset per piece",
    "100kg plastic removed",
    "handcrafted in limited runs",
    "carbon-negative by default",
    "sapphire · matte ceramic case",
  ];
  const line = [...items, ...items];
  return (
    <div className="border-y border-[color:var(--border)] py-5 overflow-hidden bg-[color:var(--surface)]">
      <div className="flex whitespace-nowrap marquee gap-12">
        {line.map((t, i) => (
          <span key={i} className="serif italic text-lg text-[color:var(--muted-foreground)] flex items-center gap-12">
            {t}
            <span className="text-[color:var(--gold)]">◐</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Collection card slider (swipeable) ---------- */
const PIECES = [
  {
    ref: "MNK — 01",
    name: "The Original",
    images: [
      { src: watchHero, label: "Front" },
      { src: watchDial, label: "Dial" },
      { src: watchSide, label: "Profile" },
      { src: watchMovement, label: "Caliber" },
      { src: watchWrist, label: "On wrist" },
    ],
    price: "$1,280",
    lede: "A 41mm matte ceramic case housing our Reverse caliber — the world's first movement engineered to tick anti-clockwise. Signed, numbered, and quiet.",
    specs: [
      ["Case", "Matte ceramic · 41mm"],
      ["Movement", "Reverse Cal. 26R"],
      ["Glass", "Domed sapphire"],
      ["Strap", "Vegan Nappa · black"],
    ],
    status: "AVAILABLE",
  },
  {
    ref: "MNK — 02",
    name: "Coming into archive",
    images: [
      { src: watchSide, label: "Profile" },
      { src: watchMovement, label: "Caliber" },
    ],
    price: "TBA",
    lede: "The second reference is being turned by hand. Join the list to be the first notified when it enters the archive.",
    specs: [
      ["Case", "TBA"],
      ["Movement", "Reverse Cal. 26R"],
      ["Glass", "Domed sapphire"],
      ["Availability", "Chapter Two · 2026"],
    ],
    status: "IN THE MAKING",
  },
];

type Piece = (typeof PIECES)[number];

function PieceCard({ piece, isFirst }: { piece: Piece; isFirst: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  const active = piece.images[imgIdx];
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistId = useMemo(() => `piece-${piece.ref.replace(/\W+/g, "-")}`, [piece.ref]);

  const focusThumb = (n: number) => {
    const next = (n + piece.images.length) % piece.images.length;
    setImgIdx(next);
    thumbRefs.current[next]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight") { e.preventDefault(); focusThumb(i + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusThumb(i - 1); }
    else if (e.key === "Home") { e.preventDefault(); focusThumb(0); }
    else if (e.key === "End") { e.preventDefault(); focusThumb(piece.images.length - 1); }
  };

  return (
    <article className="snap-start flex-shrink-0 w-full grid md:grid-cols-2 gap-0 border border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="relative bg-[#e8e2d5] flex flex-col min-w-0">
        <div
          className="relative aspect-square md:aspect-auto md:flex-1 overflow-hidden"
          aria-live="polite"
        >
          {piece.images.map((im, i) => {
            // Preload the first two angles of each piece (LCP + first swap),
            // lazy-load the rest so the gallery stays light on data.
            const eager = isFirst && i < 2;
            return (
              <img
                key={i}
                src={im.src}
                alt={i === imgIdx ? `${piece.name} — ${im.label} view` : ""}
                aria-hidden={i !== imgIdx}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
                loading={eager ? "eager" : "lazy"}
                fetchPriority={i === 0 && isFirst ? "high" : "auto"}
                decoding="async"
                width={1280}
                height={1280}
              />
            );
          })}
          <span className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.25em] bg-[color:var(--foreground)] text-[color:var(--primary-foreground)] px-2.5 py-1.5">
            {piece.status}
          </span>
          <span className="absolute bottom-4 right-4 z-10 serif italic text-[color:var(--primary-foreground)]/70 text-sm">
            {active.label}
          </span>
        </div>
        {piece.images.length > 1 && (
          <div
            role="tablist"
            aria-label={`${piece.name} — angle views`}
            id={tablistId}
            className="grid grid-flow-col auto-cols-[minmax(3rem,1fr)] sm:auto-cols-[3.5rem] gap-2 p-3 bg-[color:var(--surface)] border-t border-[color:var(--border)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {piece.images.map((im, i) => {
              const selected = i === imgIdx;
              return (
                <button
                  key={i}
                  ref={(el) => { thumbRefs.current[i] = el; }}
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Show ${im.label} view`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setImgIdx(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`relative aspect-square overflow-hidden border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] ${
                    selected
                      ? "border-[color:var(--gold)] opacity-100"
                      : "border-[color:var(--border)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={im.src} alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <span className="sr-only">{im.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-6 sm:p-8 lg:p-12 flex flex-col min-w-0">
        <p className="eyebrow mb-4">{piece.ref}</p>
        <h3 className="serif italic text-3xl sm:text-4xl lg:text-5xl mb-5 font-light">{piece.name}</h3>
        <p className="text-[14px] leading-relaxed text-[color:var(--muted-foreground)] mb-8">{piece.lede}</p>
        <p className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--gold)] mb-6">
          Offsets 1 ton CO₂ · 100kg plastic
        </p>
        <dl className="grid grid-cols-1 gap-3 text-[13px] mb-10 border-t border-[color:var(--border)] pt-6">
          {piece.specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-[color:var(--muted-foreground)]">{k}</dt>
              <dd className="text-[color:var(--foreground)] text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--border)] pt-6">
          <div className="min-w-0">
            <div className="serif text-3xl">{piece.price}</div>
            <div className="text-[11px] text-[color:var(--muted-foreground)] mt-1">
              Ships in 6–8 weeks · Carbon-neutral shipping
            </div>
          </div>
          <a
            id={isFirst ? "reserve" : undefined}
            href="#"
            className="shrink-0 text-[12px] tracking-[0.2em] uppercase bg-[color:var(--foreground)] text-[color:var(--primary-foreground)] px-5 py-3 hover:bg-[color:var(--gold)] transition-colors"
          >
            {piece.status === "AVAILABLE" ? "Reserve piece" : "Join the list"}
          </a>
        </div>
      </div>
    </article>
  );
}

function Collection() {
  const [i, setI] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const clamped = Math.max(0, Math.min(PIECES.length - 1, n));
    setI(clamped);
    trackRef.current?.scrollTo({ left: trackRef.current.clientWidth * clamped, behavior: "smooth" });
  };
  return (
    <section id="collection" className="py-24 lg:py-32 border-t border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-14 gap-10 flex-wrap">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">02 — The Piece</p>
            <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] font-normal">
              Handcrafted <span className="serif italic text-[color:var(--gold)]">Style</span><br />
              and Statement Pieces.
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
            Each Monockle is assembled by hand in a limited run — one movement, many stories.
            New references arrive as the archive grows. Swipe to explore.
          </p>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-6 lg:-mx-10 px-6 lg:px-10 gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const el = e.currentTarget;
              setI(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {PIECES.map((p, idx) => (
              <PieceCard key={idx} piece={p} isFirst={idx === 0} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {PIECES.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Piece ${idx + 1}`}
                  onClick={() => go(idx)}
                  className={`h-[2px] transition-all ${i === idx ? "w-10 bg-[color:var(--gold)]" : "w-6 bg-[color:var(--border)]"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => go(i - 1)}
                className="w-11 h-11 border border-[color:var(--border)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                onClick={() => go(i + 1)}
                className="w-11 h-11 border border-[color:var(--border)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
                aria-label="Next"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Process (Buntabeer-style scroll pin) ---------- */
const STEPS = [
  {
    n: "01",
    title: "Turn the crown backward.",
    body:
      "Where every other watch winds forward, Monockle's crown loads a spring that drives the escapement in reverse. The tick you hear is opposite the world.",
    img: watchHero,
  },
  {
    n: "02",
    title: "The Reverse caliber holds.",
    body:
      "Our 26R movement is hand-assembled with a modified anchor and inverted gear train. It measures the same seconds — it just refuses to bow to them.",
    img: watchMovement,
  },
  {
    n: "03",
    title: "Sapphire seals the intent.",
    body:
      "A domed sapphire crystal, scratch-resistant to 9 Mohs, protects the dial. The rehaut is engraved with a single line: TURN IT BACK.",
    img: watchSide,
  },
  {
    n: "04",
    title: "Wear it. Undo something.",
    body:
      "Every Monockle on a wrist is 1 ton of CO₂ offset and 100kg of plastic removed — funded at purchase, not promised later.",
    img: watchHero,
  },
];

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
    setActive(idx);
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  return (
    <section id="process" ref={ref} className="relative border-t border-[color:var(--border)]" style={{ height: `${STEPS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-10 pt-20 lg:pt-24 pb-4 lg:pb-6">
          <p className="eyebrow mb-3 lg:mb-4">03 — The Reverse</p>
          <h2 className="text-[clamp(1.25rem,3.2vw,2.75rem)] leading-[1.15] tracking-[-0.02em] font-normal max-w-3xl">
            This isn't a gimmick.<br />
            <span className="serif italic text-[color:var(--gold)]">It's engineering</span> — one turn at a time.
          </h2>
        </div>

        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 gap-4 sm:gap-8 lg:gap-16 items-center pb-16 lg:pb-24">
          <motion.div
            style={{ rotate, scale }}
            className="relative aspect-square max-w-[160px] sm:max-w-[320px] lg:max-w-[560px] w-full mx-auto"
          >
            {STEPS.map((s, i) => (
              <motion.img
                key={i}
                src={s.img}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover rounded-full"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <div className="absolute -inset-2 lg:-inset-4 rounded-full border border-[color:var(--gold)]/30 pointer-events-none" />
          </motion.div>

          <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px]">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  y: i === active ? 0 : 16,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                aria-hidden={i !== active}
                className={`absolute inset-0 ${i === active ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <div className="serif text-3xl sm:text-5xl lg:text-6xl text-[color:var(--gold)] mb-2 sm:mb-4">{s.n}</div>
                <h3 className="text-base sm:text-2xl lg:text-4xl font-normal leading-tight mb-3 sm:mb-6 max-w-md">{s.title}</h3>
                <p className="text-[12px] sm:text-[14px] lg:text-[15px] leading-relaxed text-[color:var(--muted-foreground)] max-w-md">{s.body}</p>
              </motion.div>
            ))}
            <div className="absolute -bottom-6 sm:-bottom-10 left-0 right-0 flex gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-[2px] flex-1 transition-colors ${i <= active ? "bg-[color:var(--gold)]" : "bg-[color:var(--border)]"}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- Rotating Earth (1996 → 2026) ---------- */
function EarthMorph() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const morph = useTransform(scrollYProgress, [0.15, 0.85], [0, 1]);
  const year = useTransform(morph, (v) => Math.round(1996 + v * 30));
  const [displayYear, setDisplayYear] = useState(1996);
  useMotionValueEvent(year, "change", (v) => setDisplayYear(v));
  const reveal2026 = useTransform(morph, (v) => `inset(0 ${100 - v * 100}% 0 0)`);

  return (
    <section id="impact" ref={ref} className="py-24 lg:py-40 border-t border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">04 — Why time matters</p>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] font-normal">
            Thirty years<br />
            <span className="serif italic text-[color:var(--gold)]">the wrong way.</span><br />
            We're turning it back.
          </h2>
          <p className="mt-8 text-[14px] leading-relaxed text-[color:var(--muted-foreground)] max-w-md">
            Scroll to watch three decades pass. Greenery recedes, ice retreats, plastic accumulates.
            The clock we wear runs the other way — a quiet protest, funded per piece.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">
            <div>
              <div className="serif text-2xl">-40%</div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-[color:var(--muted-foreground)] mt-1">Polar ice, since 1996</div>
            </div>
            <div>
              <div className="serif text-2xl">1.24 M t</div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-[color:var(--muted-foreground)] mt-1">Ocean plastic, last year</div>
            </div>
          </div>
          <p className="mt-8 text-[11px] tracking-[0.18em] uppercase text-[color:var(--muted-foreground)]">
            Sources · NASA GISS · NOAA · UNEP
          </p>
        </div>

        <div className="lg:col-span-7 relative aspect-square max-w-[620px] w-full mx-auto">
          <motion.div style={{ rotate }} className="absolute inset-0 rounded-full overflow-hidden">
            <img
              src={earth1996}
              alt="Earth 1996"
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
              width={1024}
              height={1024}
            />
            <motion.img
              src={earth2026}
              alt="Earth 2026"
              style={{ clipPath: reveal2026 }}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
              width={1024}
              height={1024}
            />
          </motion.div>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,transparent_60%,#0F0F10_75%)] pointer-events-none" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center">
            <div className="serif text-5xl tabular-nums">{displayYear}</div>
            <div className="eyebrow mt-1">present view</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Venn Diagram ---------- */
const VENN = {
  people: {
    label: "People",
    body: "Handcrafted by a small atelier — fair wages, no piece assembled in under 40 hours. Every owner receives the maker's signature on the caseback.",
    points: ["Fair-wage atelier", "40+ hours per piece", "Owner signature"],
  },
  planet: {
    label: "Planet",
    body: "Carbon-negative by default. 1 ton CO₂ offset and 100kg of plastic pulled per piece — funded at purchase, verified quarterly.",
    points: ["1 t CO₂ offset / piece", "100 kg plastic removed", "Carbon-shipped worldwide"],
  },
  prosperity: {
    label: "Prosperity",
    body: "A closed loop: profits reinvested into ocean cleanup partners and a public offset ledger. The watch is the receipt.",
    points: ["Public offset ledger", "Ocean-cleanup partners", "Verified reinvestment"],
  },
};

function Venn() {
  const [active, setActive] = useState<keyof typeof VENN>("planet");
  const v = VENN[active];
  return (
    <section className="py-24 lg:py-32 border-t border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <p className="eyebrow mb-5">05 — Triple Bottom Line</p>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] font-normal max-w-3xl">
          Cohesion, consciousness,<br />
          <span className="serif italic text-[color:var(--gold)]">and the intersection between.</span>
        </h2>

        <div className="mt-16 grid lg:grid-cols-2 gap-16 items-center">
          {/* Venn */}
          <div className="relative aspect-square max-w-[520px] w-full mx-auto">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <filter id="soft"><feGaussianBlur stdDeviation="0.4" /></filter>
              </defs>
              {/* People — top */}
              <circle
                cx="200" cy="150" r="110"
                fill="var(--foreground)"
                fillOpacity={active === "people" ? 0.35 : 0.12}
                stroke="var(--foreground)" strokeOpacity="0.6"
                className="cursor-pointer transition-all"
                onClick={() => setActive("people")}
              />
              {/* Planet — bottom left */}
              <circle
                cx="140" cy="250" r="110"
                fill="var(--green)"
                fillOpacity={active === "planet" ? 0.55 : 0.22}
                stroke="var(--green)" strokeOpacity="0.9"
                className="cursor-pointer transition-all"
                onClick={() => setActive("planet")}
              />
              {/* Prosperity — bottom right */}
              <circle
                cx="260" cy="250" r="110"
                fill="var(--gold)"
                fillOpacity={active === "prosperity" ? 0.5 : 0.18}
                stroke="var(--gold)" strokeOpacity="0.9"
                className="cursor-pointer transition-all"
                onClick={() => setActive("prosperity")}
              />
              <text x="200" y="90" textAnchor="middle" className="serif" fontSize="18" fill="var(--foreground)"
                onClick={() => setActive("people")} style={{ cursor: "pointer" }}>People</text>
              <text x="70" y="310" textAnchor="middle" className="serif" fontSize="18" fill="var(--foreground)"
                onClick={() => setActive("planet")} style={{ cursor: "pointer" }}>Planet</text>
              <text x="330" y="310" textAnchor="middle" className="serif" fontSize="18" fill="var(--foreground)"
                onClick={() => setActive("prosperity")} style={{ cursor: "pointer" }}>Prosperity</text>
              <text x="200" y="215" textAnchor="middle" className="serif italic" fontSize="13" fill="var(--foreground)" letterSpacing="2">
                MONOCKLE
              </text>
            </svg>
          </div>

          <div>
            <div className="flex gap-3 mb-6">
              {(Object.keys(VENN) as (keyof typeof VENN)[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setActive(k)}
                  className={`text-[11px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
                    active === k
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : "border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  {VENN[k].label}
                </button>
              ))}
            </div>
            <h3 className="serif italic text-4xl mb-5 font-light">{v.label}</h3>
            <p className="text-[15px] leading-relaxed text-[color:var(--muted-foreground)] max-w-lg">{v.body}</p>
            <ul className="mt-8 space-y-3 text-[14px]">
              {v.points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--gold)]" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-10">Tap a circle to explore →</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const VOICES = [
  {
    quote: "The only watch that makes standing still feel like progress.",
    name: "Aarav K.",
    role: "Owner · Ref. MNK-01 · Mumbai",
  },
  {
    quote: "I bought it as a gift and ended up keeping it. Now it's part of who I am.",
    name: "Léa M.",
    role: "Architect · Paris",
  },
  {
    quote: "Sapphire, matte dial, real ethics. Feels like the first watch of a new decade.",
    name: "James O.",
    role: "Editor · Brooklyn",
  },
];

function Voices() {
  return (
    <section id="voices" className="py-24 lg:py-32 border-t border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <p className="eyebrow mb-5">06 — In the wild</p>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] font-normal max-w-3xl">
          The people <span className="serif italic text-[color:var(--gold)]">running</span> time back.
        </h2>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {VOICES.map((v) => (
            <figure key={v.name} className="border border-[color:var(--border)] p-8 bg-[color:var(--surface)] flex flex-col">
              <div className="text-[color:var(--gold)] tracking-[0.4em] text-sm mb-6">★★★★★</div>
              <blockquote className="serif italic text-xl leading-snug flex-1">
                &ldquo;{v.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-[color:var(--border)]">
                <div className="text-sm">{v.name}</div>
                <div className="text-[11px] tracking-[0.15em] uppercase text-[color:var(--muted-foreground)] mt-1">{v.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function Invitation() {
  return (
    <section className="border-t border-[color:var(--border)] bg-[color:var(--foreground)] text-[color:var(--primary-foreground)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--primary-foreground)]/60 mb-5">
            The invitation
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em] font-normal">
            Wear the <span className="serif italic">reverse.</span><br />
            Own the impact.
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p className="text-[14px] leading-relaxed opacity-70 mb-8">
            Buy. Wear. Undo. Every second counts, and every purchase quietly puts one back.
          </p>
          <a
            href="#collection"
            className="inline-block bg-[color:var(--primary-foreground)] text-[color:var(--foreground)] px-6 py-3.5 text-[12px] tracking-[0.2em] uppercase hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)] transition-colors"
          >
            Reserve your piece
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] py-14">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid md:grid-cols-4 gap-10 text-[13px]">
        <div>
          <div className="serif text-xl tracking-widest">MONOCKLE</div>
          <p className="mt-4 text-[color:var(--muted-foreground)] text-[12px] leading-relaxed">
            The reverse movement. Handcrafted in limited runs.
          </p>
        </div>
        {[
          { h: "Piece", l: ["The Original", "Archive", "Reserve"] },
          { h: "Story", l: ["The Reverse", "Impact ledger", "Atelier"] },
          { h: "Contact", l: ["Concierge", "Press", "Instagram"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="eyebrow mb-4">{c.h}</div>
            <ul className="space-y-2 text-[color:var(--muted-foreground)]">
              {c.l.map((x) => (
                <li key={x}>
                  <a href="#" className="hover:text-[color:var(--foreground)] transition-colors">{x}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mt-12 pt-6 border-t border-[color:var(--border)] flex justify-between text-[11px] tracking-[0.15em] uppercase text-[color:var(--muted-foreground)]">
        <span>© 2026 Monockle</span>
        <span>Turning it back, one wrist at a time.</span>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <ScrollVideoHero />
      <Marquee />
      <Collection />
      <Process />
      <EarthMorph />
      <Venn />
      <Voices />
      <Invitation />
      <Footer />
    </div>
  );
}
