import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The actual video is stored in: public/videos/monockle-hero.mp4
const VIDEO_URL = `${import.meta.env.BASE_URL}videos/monockle-hero.mp4`;;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- Live counters ---------- */
const START = new Date("2024-01-01T00:00:00Z").getTime();
const CO2_PER_SEC = 12480 / ((Date.now() - START) / 1000);
const PLASTIC_PER_SEC = CO2_PER_SEC * 100;

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

function LiveStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="serif text-2xl md:text-3xl font-light tabular-nums text-white">
        {value}
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 ml-2 align-middle">
          {unit}
        </span>
      </div>
      <div className="text-[10px] tracking-[0.25em] uppercase text-white/60 mt-2 relative pl-4">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[color:var(--green)] animate-pulse" />
        {label}
      </div>
    </div>
  );
}

// Map progress p to opacity that ramps up from `inStart`→`inEnd`
// and (optionally) ramps down from `outStart`→`outEnd`. Values outside are 0/1.
function stageOpacity(p: number, inStart: number, inEnd: number, outStart = 1, outEnd = 1) {
  const fadeIn = inEnd <= inStart
    ? p >= inStart ? 1 : 0
    : gsap.utils.clamp(0, 1, (p - inStart) / (inEnd - inStart));
  const fadeOut =
    outStart >= 1
      ? 1
      : outEnd <= outStart
        ? p < outStart ? 1 : 0
        : 1 - gsap.utils.clamp(0, 1, (p - outStart) / (outEnd - outStart));
  return Math.min(fadeIn, fadeOut);
}

/**
 * Cinematic hero: pins the viewport, scrubs video by scroll,
 * and reveals text blocks in stages.
 */
export default function ScrollVideoHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const counters = useLiveCounters();

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onRm = () => setReducedMotion((prev) => (prev !== rm.matches ? rm.matches : prev));
    onRm();
    rm.addEventListener("change", onRm);
    return () => {
      rm.removeEventListener("change", onRm);
    };
  }, []);


  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = VIDEO_URL;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Pinned scroll-scrub + staged text reveal across desktop, tablet, and mobile.
  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const video = videoRef.current;
    if (!wrapper || !sticky || !video) return;

    const ctx = gsap.context(() => {}, wrapper);
    let trigger: ScrollTrigger | null = null;
    let cancelled = false;
    let targetTime = 0;
    let rafId = 0;
    let seeking = false;
    let videoDuration = Number.isFinite(video.duration) ? video.duration : 0;

    const tick = () => {
      rafId = 0;
      if (cancelled || !videoDuration) return;
      if (Math.abs(video.currentTime - targetTime) < 0.02) return;
      if (seeking) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      seeking = true;
      video.currentTime = targetTime;
    };
    const onSeeked = () => {
      seeking = false;
      if (Math.abs(video.currentTime - targetTime) > 0.02) {
        rafId = requestAnimationFrame(tick);
      }
    };
    video.addEventListener("seeked", onSeeked);

    const applyStages = (p: number) => {
      // Both eyebrow + headline are visible from the start so the hero
      // reads as a complete first impression on page load; they fade
      // as the user scrolls to make room for copy and CTA.
      const stages: Array<[HTMLElement | null, number, number, number, number]> = [
        [eyebrowRef.current, 0.0, 0.0, 0.2, 0.28],     // visible on load
        [headlineRef.current, 0.0, 0.0, 0.5, 0.6],     // visible on load
        [copyRef.current, 0.25, 0.4, 0.62, 0.72],
        [actionsRef.current, 0.55, 0.75, 2, 2],
      ];
      for (const [el, i0, i1, o0, o1] of stages) {
        if (!el) continue;
        const op = stageOpacity(p, i0, i1, o0, o1);
        gsap.set(el, { opacity: op, y: (1 - op) * 18 });
      }
    };

    const updateVideo = (progress: number) => {
      if (!videoDuration) return;
      targetTime = progress * videoDuration;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const setup = () => {
      if (cancelled) return;

      // Start states
      applyStages(0);

      ctx.add(() => {
        trigger = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          pin: sticky,
          pinSpacing: false,
          scrub: 0.4,
          onUpdate: (self) => {
            updateVideo(self.progress);
            applyStages(self.progress);
          },
        });
      });
      ScrollTrigger.refresh();
    };

    const onReady = () => {
      videoDuration = Number.isFinite(video.duration) ? video.duration : 0;
      video.pause();
      if (trigger) updateVideo(trigger.progress);
    };

    setup();

    if (video.readyState >= 1 && video.duration) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.load();
    }

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("seeked", onSeeked);
      // Reverting the context restores ScrollTrigger's pin-spacer DOM before
      // React or media-query changes can remove pinned nodes.
      ctx.revert();
      trigger = null;
    };
  }, [reducedMotion]);

  // When scroll-scrub is disabled for reduced-motion users, mirror the desktop
  // opening frame without pinning or scrubbing.
  useEffect(() => {
    if (!reducedMotion) return;
    for (const el of [eyebrowRef.current, headlineRef.current]) {
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0px)";
      }
    }
  }, [reducedMotion]);





  const overlay = (
    <div className="relative z-10 w-full h-full flex items-center">
      <div
        className="max-w-[1100px] mx-auto w-full px-6 lg:px-10 pt-16 text-center flex flex-col items-center"
        style={{ textShadow: "0 2px 24px rgba(0,0,0,0.75)" }}
      >
        <p
          ref={eyebrowRef}
          className="text-[11px] tracking-[0.28em] uppercase text-white mb-6"
          style={{ opacity: 1, transform: "translateY(0px)" }}
        >
          Est. 2026 · Chapter 01 · Reverse Horlogerie
        </p>
        <h1
          ref={headlineRef}
          className="font-normal leading-[1.08] tracking-normal text-[clamp(1.75rem,3.4vw,3rem)] text-white max-w-2xl"
          style={{ opacity: 1, transform: "translateY(0px)" }}
        >
          Engineered to turn time back.
        </h1>
        <p
          ref={copyRef}
          className="mt-8 max-w-xl text-[15px] leading-relaxed text-white"
          style={{ opacity: 0 }}
        >
          World's 1st watch engineered to move against time, ticking anti-clockwise beneath sapphire glass.
          Every piece offsets 1 ton of CO₂ and removes 100kg of plastic.
        </p>
        <div
          ref={actionsRef}
          className="mt-10 flex flex-col items-center gap-10 w-full"
          style={{ opacity: 0 }}
        >
          <a
            href="#collection"
            className="group inline-flex items-center gap-3 bg-white text-black px-6 py-3.5 text-[12px] tracking-[0.2em] uppercase hover:bg-[color:var(--gold)] hover:text-white transition-colors"
          >
            Explore Monockle Timepieces
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <div className="grid grid-cols-3 gap-6 max-w-2xl w-full">
            <LiveStat label="CO₂ offset · live" value={fmt(counters.co2, 2)} unit="tons" />
            <LiveStat label="Plastic removed" value={fmt(counters.plastic / 1000, 2)} unit="tonnes" />
            <LiveStat label="Owners" value={fmt(counters.pieces)} unit="pieces" />
          </div>
        </div>
      </div>
    </div>
  );

  const enableScroll = !reducedMotion;

  return (
    <section
      ref={wrapperRef}
      aria-label="Monockle cinematic intro"
      className="relative w-full bg-black"
      style={{ height: enableScroll ? "300vh" : "100svh" }}
    >
      <div
        ref={stickyRef}
        className="relative w-full h-screen min-h-[100svh] overflow-hidden"
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload={enableScroll ? "auto" : "metadata"}
          disablePictureInPicture
          disableRemotePlayback
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_65%)] pointer-events-none" />
        {overlay}
      </div>
    </section>
  );
}

