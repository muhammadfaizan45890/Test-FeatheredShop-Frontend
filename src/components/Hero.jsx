/* eslint-disable no-unused-vars */
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  Sparkles,
  Recycle,
  ShieldCheck,
  Truck,
  Star,
  Footprints,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// ✅ Import banner image from assets
import shoeBanner from "../assets/shoes-banner2.jpg";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches navbar / hero / footer / login / signup
 * ───────────────────────────────────────────────────────────────── */
const palette = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F5F5F5",
  ink: "#171717",
  inkSoft: "#525252",
  inkMuted: "#A3A3A3",
  border: "#E5E5E5",
  accent: "#171717",
  accentDeep: "#0A0A0A",
  gold: "#F59E0B",
  success: "#10B981",
};

/* ─────────────────────────────────────────────────────────────────
 * BANNER CONTENT — edit here
 * ───────────────────────────────────────────────────────────────── */
const BANNER = {
  eyebrow: "Vintage & Pre-Loved Kicks",
  title: "Fresh pairs.",
  titleAccent: "Second life, first choice.",
  description:
    "Hand-picked, authenticated, and deep-cleaned sneakers from the world's best brands. Sustainable style that doesn't cost the earth — or your wallet.",
  primaryCta: { label: "Shop the drop", to: "/shop" },
  secondaryCta: { label: "How it works", to: "/about" },
  // ✅ Use the imported local asset
  image: shoeBanner,
  imageAlt: "A curated selection of vintage sneakers on display",
};

const TRUST_ITEMS = [
  { icon: Star, label: "4.9 · 8,200+ kicks sold" },
  { icon: Recycle, label: "100% authenticated" },
  { icon: ShieldCheck, label: "30-day returns" },
  { icon: Truck, label: "Free shipping over $75" },
];

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .home-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .home-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 96;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .home-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .home-hd-num { font-variant-numeric: tabular-nums; }
  @keyframes home-scroll-hint {
    0% { transform: translateY(-100%); opacity: 0; }
    40% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .home-scroll-hint-bar { animation: none !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
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

/* ─────────────────────────────────────────────────────────────────
 * ScrollHint
 * ───────────────────────────────────────────────────────────────── */
const ScrollHint = memo(function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      aria-hidden="true"
      className="
        absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2
        hidden sm:flex flex-col items-center gap-2
        z-10 pointer-events-none
      "
    >
      <span
        className="home-hd-sans text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: "rgba(255, 255, 255, 0.7)" }}
      >
        Scroll
      </span>
      <span
        className="relative w-px h-10 overflow-hidden"
        style={{ background: "rgba(255, 255, 255, 0.25)" }}
      >
        <span
          className="home-scroll-hint-bar absolute inset-x-0 top-0 h-1/2"
          style={{
            background: "#FFFFFF",
            animation: "home-scroll-hint 1.8s ease-in-out infinite",
          }}
        />
      </span>
      <ArrowDown
        className="h-3.5 w-3.5"
        style={{ color: "rgba(255, 255, 255, 0.7)" }}
        strokeWidth={2.25}
      />
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Banner — the main hero
 * ───────────────────────────────────────────────────────────────── */
const Banner = memo(function Banner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Image parallax: moves slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  // Content moves a bit faster for depth
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  // Fade out toward the end of the scroll
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      aria-labelledby="banner-heading"
      className="relative w-full overflow-hidden"
      style={{
        height: "min(88vh, 780px)",
        minHeight: "560px",
        background: palette.accentDeep,
      }}
    >
      {/* Background image with parallax */}
      <motion.div
        aria-hidden="true"
        style={{ y: imageY }}
        className="absolute inset-0 w-full h-[120%]"
      >
        <img
          src={BANNER.image}
          alt=""
          fetchpriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Gradient overlay for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.75) 0%,
              rgba(0, 0, 0, 0.55) 30%,
              rgba(0, 0, 0, 0.25) 60%,
              rgba(0, 0, 0, 0.35) 100%
            )
          `,
        }}
      />

      {/* Subtle vignette on edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 40%,
              rgba(0, 0, 0, 0.3) 100%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative h-full w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center">
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          style={{ y: contentY, opacity }}
          className="max-w-2xl w-full"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <span
              className="
                home-hd-sans inline-flex items-center gap-2
                px-3 py-1.5
                rounded-full
                text-[10.5px] font-semibold uppercase tracking-[0.2em]
                backdrop-blur-md
              "
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
              }}
            >
              <Footprints
                className="h-3 w-3"
                style={{ color: palette.gold }}
                strokeWidth={2.25}
                aria-hidden="true"
              />
              {BANNER.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            id="banner-heading"
            className="
              home-hd-serif
              mt-5 sm:mt-6
              text-[clamp(2.25rem,6.5vw,4.5rem)]
              font-medium
              leading-[1.02]
              tracking-[-0.035em]
            "
            style={{ color: "#FFFFFF" }}
          >
            {BANNER.title}
            <br />
            <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              {BANNER.titleAccent}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="
              home-hd-sans
              mt-5 sm:mt-6
              max-w-lg
              text-[14.5px] sm:text-base
              leading-relaxed
            "
            style={{ color: "rgba(255, 255, 255, 0.75)" }}
          >
            {BANNER.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link
              to={BANNER.primaryCta.to}
              className="
                home-hd-sans group
                inline-flex items-center justify-center gap-2
                h-12 px-6
                rounded-full
                text-[13.5px] font-semibold tracking-[-0.005em]
                transition-[background-color,transform,box-shadow]
                duration-200
                active:scale-[0.99]
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{
                background: "#FFFFFF",
                color: palette.ink,
                boxShadow: "0 10px 24px -12px rgba(0,0,0,0.5)",
              }}
            >
              {BANNER.primaryCta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </Link>

            <Link
              to={BANNER.secondaryCta.to}
              className="
                home-hd-sans
                inline-flex items-center justify-center gap-2
                h-12 px-6
                rounded-full
                text-[13.5px] font-semibold tracking-[-0.005em]
                transition-[background-color,border-color,transform]
                duration-200
                active:scale-[0.99]
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
              }}
            >
              {BANNER.secondaryCta.label}
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.ul
            variants={itemVariants}
            className="
              mt-8 sm:mt-10
              flex flex-wrap items-center
              gap-x-5 gap-y-3
            "
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="
                  home-hd-sans
                  flex items-center gap-2
                  text-[11.5px] font-medium tracking-[0.01em]
                "
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <ScrollHint />
    </section>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Home — main
 * ───────────────────────────────────────────────────────────────── */
function Home() {
  return (
    <main
      className="home-hd-root relative w-full"
      style={{ background: palette.bg }}
    >
      <style>{HD_CSS}</style>

      <Banner />
    </main>
  );
}

export default memo(Home);
