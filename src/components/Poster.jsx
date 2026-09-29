/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches the rest of the landing page
 * ───────────────────────────────────────────────────────────────── */
const palette = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceRaised: "#FFFFFF",
  ink: "#171717",
  inkSoft: "#525252",
  inkMuted: "#A3A3A3",
  border: "#EAEAEA",
  borderStrong: "#D4D4D4",
  accent: "#171717",
  accentDeep: "#0A0A0A",
  gold: "#F59E0B",
  danger: "#EF4444",
  success: "#10B981",
  shadowSm: "rgba(0, 0, 0, 0.04)",
  shadowMd: "rgba(0, 0, 0, 0.08)",
  shadowLg: "rgba(0, 0, 0, 0.12)",
};

/* ─────────────────────────────────────────────────────────────────
 * POSTER DATA — edit here
 * ───────────────────────────────────────────────────────────────── */
const POSTER = {
  eyebrow: "Just Landed",
  badge: "New",
  title: "The New Arrivals.",
  titleAccent: "Fresh heat, weekly drops.",
  description:
    "Hand-picked silhouettes, limited runs, and rare colorways. Straight from the vault — before they're gone.",
  primaryCta: { label: "Shop new arrivals", to: "/new-arrivals" },
  secondaryCta: { label: "View lookbook", to: "/collections" },
  heroImage:
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=85&auto=format&fit=crop",
  heroImageAlt: "New arrivals sneaker hero shot",
};

const STATS = [
  { value: "120+", label: "New styles this week" },
  { value: "48h", label: "Early-access window" },
  { value: "Ltd.", label: "Limited colorways" },
];

/* Thumbnail strip — 4 mini previews to give the poster editorial depth */
const THUMBNAILS = [
  {
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80&auto=format&fit=crop",
    label: "Air Max",
  },
  {
    src: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80&auto=format&fit=crop",
    label: "Retro High",
  },
  {
    src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80&auto=format&fit=crop",
    label: "Runner Pro",
  },
  {
    src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80&auto=format&fit=crop",
    label: "Court Low",
  },
];

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS — injected once
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .newarr-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1, "cv11" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .newarr-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 96;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .newarr-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .newarr-hd-num { font-variant-numeric: tabular-nums; }
  @keyframes newarr-pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.35); opacity: 0.55; }
  }
  @keyframes newarr-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .newarr-pulse-dot { animation: newarr-pulse-dot 1.6s ease-in-out infinite; }
  .newarr-shimmer {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.35) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 200% 100%;
    animation: newarr-shimmer 2.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .newarr-pulse-dot, .newarr-shimmer { animation: none !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const thumbVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: 0.35 + i * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─────────────────────────────────────────────────────────────────
 * LiveBadge — "New" pill with pulsing dot
 * ───────────────────────────────────────────────────────────────── */
const LiveBadge = memo(function LiveBadge() {
  return (
    <span
      className="
        newarr-hd-sans inline-flex items-center gap-2
        px-3 py-1.5 rounded-full
        text-[10.5px] font-bold uppercase tracking-[0.18em]
        backdrop-blur-md
      "
      style={{
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#FFFFFF",
      }}
    >
      <span
        className="newarr-pulse-dot inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: palette.gold }}
        aria-hidden="true"
      />
      {POSTER.badge}
    </span>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ThumbnailCard — small editorial preview
 * ───────────────────────────────────────────────────────────────── */
const ThumbnailCard = memo(function ThumbnailCard({ item, index }) {
  return (
    <motion.div
      variants={thumbVariants}
      custom={index}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative shrink-0 w-[110px] sm:w-[130px] lg:w-[150px] aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: `0 12px 28px -14px ${palette.shadowLg}`,
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <img
        src={item.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="
          absolute inset-0 w-full h-full object-cover
          transition-transform duration-700 ease-out
          group-hover:scale-110
        "
      />

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)",
        }}
      />

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p
          className="newarr-hd-sans text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          New
        </p>
        <p
          className="newarr-hd-sans text-[12.5px] font-semibold mt-0.5 truncate"
          style={{ color: "#FFFFFF" }}
        >
          {item.label}
        </p>
      </div>

      {/* Corner arrow on hover */}
      <ArrowUpRight
        aria-hidden="true"
        className="
          absolute top-2.5 right-2.5 w-4 h-4
          opacity-0 -translate-y-1 translate-x-1
          transition-all duration-300
          group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0
        "
        style={{ color: "#FFFFFF" }}
        strokeWidth={2.25}
      />
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Poster — main component
 * ───────────────────────────────────────────────────────────────── */
const Poster = memo(function Poster() {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* Track horizontal scroll for thumbnails (mobile) */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.7, 240), behavior: "smooth" });
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="new-arrivals-heading"
      className="newarr-hd-root relative w-full"
      style={{ background: palette.bg }}
    >
      <style>{HD_CSS}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* ── POSTER CARD ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="
            relative overflow-hidden
            rounded-[28px] sm:rounded-[32px] lg:rounded-[36px]
          "
          style={{
            background: palette.accentDeep,
            boxShadow: `0 30px 60px -30px ${palette.shadowLg}`,
          }}
        >
          {/* ── Background image (right side, faded) ─── */}
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
          >
            <img
              src={POSTER.heroImage}
              alt=""
              loading="lazy"
              decoding="async"
              className="
                absolute inset-0 w-full h-full object-cover object-center
                opacity-[0.42]
              "
            />
            {/* Directional gradient: dark on left, transparent on right */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    to right,
                    rgba(10,10,10,0.95) 0%,
                    rgba(10,10,10,0.85) 35%,
                    rgba(10,10,10,0.55) 70%,
                    rgba(10,10,10,0.35) 100%
                  )
                `,
              }}
            />
            {/* Subtle vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 40%, transparent 30%, rgba(0,0,0,0.55) 100%)",
              }}
            />
          </div>

          {/* ── Content grid ─────────────────────────── */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 p-6 sm:p-10 lg:p-14">
            {/* Left: copy block */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center"
            >
              {/* Eyebrow + Live badge */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 flex-wrap"
              >
                <span
                  className="
                    newarr-hd-sans inline-flex items-center gap-1.5
                    text-[10.5px] font-semibold uppercase tracking-[0.22em]
                  "
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  <Sparkles
                    className="h-3 w-3"
                    style={{ color: palette.gold }}
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                  {POSTER.eyebrow}
                </span>
                <LiveBadge />
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={itemVariants}
                id="new-arrivals-heading"
                className="
                  newarr-hd-serif
                  mt-5
                  text-[clamp(2rem,5.6vw,3.75rem)]
                  font-medium leading-[1.02]
                  tracking-[-0.035em]
                "
                style={{ color: "#FFFFFF" }}
              >
                {POSTER.title}
                <br />
                <span style={{ color: "rgba(255,255,255,0.6)" }}>
                  {POSTER.titleAccent}
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="
                  newarr-hd-sans
                  mt-5 max-w-lg
                  text-[14px] sm:text-[15px]
                  leading-relaxed
                "
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {POSTER.description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link
                  to={POSTER.primaryCta.to}
                  className="
                    newarr-hd-sans group
                    inline-flex items-center justify-center gap-2
                    h-12 px-6 rounded-full
                    text-[13.5px] font-semibold tracking-[-0.005em]
                    transition-[background-color,transform,box-shadow]
                    duration-200
                    active:scale-[0.99]
                    outline-none focus:outline-none focus-visible:outline-none
                  "
                  style={{
                    background: "#FFFFFF",
                    color: palette.ink,
                    boxShadow: "0 12px 28px -14px rgba(0,0,0,0.6)",
                  }}
                >
                  {POSTER.primaryCta.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={POSTER.secondaryCta.to}
                  className="
                    newarr-hd-sans
                    inline-flex items-center justify-center gap-2
                    h-12 px-6 rounded-full
                    text-[13.5px] font-semibold tracking-[-0.005em]
                    transition-[background-color,border-color,transform]
                    duration-200
                    active:scale-[0.99]
                    outline-none focus:outline-none focus-visible:outline-none
                  "
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    color: "#FFFFFF",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {POSTER.secondaryCta.label}
                </Link>
              </motion.div>

              {/* Stats strip */}
              <motion.ul
                variants={itemVariants}
                className="
                  mt-8 sm:mt-10
                  grid grid-cols-3 gap-4 sm:gap-6
                  max-w-md
                  pt-6
                "
                style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
              >
                {STATS.map(({ value, label }) => (
                  <li key={label} className="flex flex-col">
                    <span
                      className="newarr-hd-serif newarr-hd-num text-[clamp(1.1rem,2.2vw,1.5rem)] font-medium tracking-tight"
                      style={{ color: "#FFFFFF" }}
                    >
                      {value}
                    </span>
                    <span
                      className="newarr-hd-sans mt-1 text-[10.5px] uppercase tracking-[0.14em] font-medium leading-snug"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right: thumbnails */}
            <div className="lg:col-span-5 xl:col-span-6 flex lg:justify-end">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="w-full lg:w-auto"
              >
                {/* Mobile scroller header */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                  <span
                    className="newarr-hd-sans text-[10.5px] uppercase tracking-[0.18em] font-semibold"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    This week's picks
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollBy(-1)}
                      disabled={!canScrollLeft}
                      aria-label="Scroll left"
                      className="
                        inline-flex items-center justify-center
                        h-8 w-8 rounded-full
                        transition-all duration-200
                        disabled:opacity-30 disabled:cursor-not-allowed
                        outline-none focus:outline-none focus-visible:outline-none
                      "
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#FFFFFF",
                      }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollBy(1)}
                      disabled={!canScrollRight}
                      aria-label="Scroll right"
                      className="
                        inline-flex items-center justify-center
                        h-8 w-8 rounded-full
                        transition-all duration-200
                        disabled:opacity-30 disabled:cursor-not-allowed
                        outline-none focus:outline-none focus-visible:outline-none
                      "
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#FFFFFF",
                      }}
                    >
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>

                {/* Thumbnails row */}
                <ul
                  ref={scrollRef}
                  className="
                    flex lg:flex-wrap lg:justify-end
                    gap-3
                    overflow-x-auto lg:overflow-visible
                    snap-x snap-mandatory
                    -mx-6 px-6 lg:mx-0 lg:px-0
                    pb-2 lg:pb-0
                    [&::-webkit-scrollbar]:hidden
                    [-ms-overflow-style:none]
                    [scrollbar-width:none]
                  "
                >
                  {THUMBNAILS.map((item, i) => (
                    <li
                      key={item.label}
                      className="snap-start shrink-0"
                    >
                      <ThumbnailCard item={item} index={i} />
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* ── Decorative corner shimmer ─────────────── */}
          <div
            aria-hidden="true"
            className="newarr-shimmer pointer-events-none absolute -top-1/2 -right-1/4 w-[60%] h-[200%] rotate-[20deg] opacity-30"
          />
        </motion.div>

        {/* ── Under-poster link row ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 sm:mt-8 flex items-center justify-between gap-4"
        >
          <span
            className="newarr-hd-sans hidden sm:inline-flex items-center gap-2 text-[12px] font-medium"
            style={{ color: palette.inkSoft }}
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            New drops every Thursday at 9AM
          </span>

          <Link
            to="/new-arrivals"
            className="
              newarr-hd-sans group inline-flex items-center gap-1.5
              text-[13px] font-semibold
              transition-opacity hover:opacity-70
              outline-none focus:outline-none focus-visible:outline-none
              ml-auto
            "
            style={{ color: palette.ink }}
          >
            See all new arrivals
            <ChevronRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

export default memo(Poster);