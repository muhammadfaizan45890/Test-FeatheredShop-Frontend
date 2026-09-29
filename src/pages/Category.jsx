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
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — light only, HD grayscale
 * ───────────────────────────────────────────────────────────────── */
const ACCENT = "#878787";
const ACCENT_DEEP = "#5C5C5C";

const palette = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceRaised: "#FFFFFF",
  ink: "#1A1A1A",         // 16.7:1 contrast on white (AAA)
  inkSoft: "#5C5C5C",     // 7.0:1 contrast on white (AA+)
  inkMuted: "#8E8E8E",    // decorative only
  border: "#EAEAEA",
  borderStrong: "#D4D4D4",
  accent: ACCENT,
  accentSoft: "rgba(135, 135, 135, 0.08)",
  accentRing: "rgba(135, 135, 135, 0.22)",
  shadowSm: "rgba(0, 0, 0, 0.04)",
  shadowMd: "rgba(0, 0, 0, 0.06)",
  shadowLg: "rgba(0, 0, 0, 0.08)",
};

/* ─────────────────────────────────────────────────────────────────
 * DATA — Famous Shoe Brands with Logos
 * Using high-quality SVG logos from Simple Icons (CDN) for reliability.
 * ───────────────────────────────────────────────────────────────── */
const BRANDS = [
  {
    name: "Nike",
    logo: "https://cdn.simpleicons.org/nike/1A1A1A",
    link: "/shop?brand=Nike",
    count: 312,
  },
  {
    name: "Adidas",
    logo: "https://cdn.simpleicons.org/adidas/1A1A1A",
    link: "/shop?brand=Adidas",
    count: 287,
  },
  {
    name: "Puma",
    logo: "https://cdn.simpleicons.org/puma/1A1A1A",
    link: "/shop?brand=Puma",
    count: 198,
  },
  {
    name: "New Balance",
    logo: "https://cdn.simpleicons.org/newbalance/1A1A1A",
    link: "/shop?brand=NewBalance",
    count: 156,
  },
  {
    name: "Reebok",
    logo: "https://cdn.simpleicons.org/reebok/1A1A1A",
    link: "/shop?brand=Reebok",
    count: 94,
  },
  {
    name: "Under Armour",
    logo: "https://cdn.simpleicons.org/underarmour/1A1A1A",
    link: "/shop?brand=UnderArmour",
    count: 118,
  },
  // {
  //   name: "Skechers",
  //   logo: "https://cdn.simpleicons.org/skechers/1A1A1A",
  //   link: "/shop?brand=Skechers",
  //   count: 132,
  // },
  {
    name: "Fila",
    logo: "https://cdn.simpleicons.org/fila/1A1A1A",
    link: "/shop?brand=Fila",
    count: 108,
  },
  // {
  //   name: "Asics",
  //   logo: "https://cdn.simpleicons.org/asics/1A1A1A",
  //   link: "/shop?brand=Asics",
  //   count: 76,
  // },
  // {
  //   name: "Converse",
  //   logo: "https://cdn.simpleicons.org/converse/1A1A1A",
  //   link: "/shop?brand=Converse",
  //   count: 142,
  // },
  // {
  //   name: "Vans",
  //   logo: "https://cdn.simpleicons.org/vans/1A1A1A",
  //   link: "/shop?brand=Vans",
  //   count: 128,
  // },
  {
    name: "Jordan",
    logo: "https://cdn.simpleicons.org/jordan/1A1A1A",
    link: "/shop?brand=Jordan",
    count: 224,
  },
];

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────────────────────────
 * HD text CSS — injected once
 * ───────────────────────────────────────────────────────────────── */
const HD_TEXT_CSS = `
  .cat-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1, "cv11" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .cat-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 40;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .cat-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .cat-hd-num { font-variant-numeric: tabular-nums; }
  .cat-scroll::-webkit-scrollbar { display: none; }
  .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  .brand-logo-img {
    filter: grayscale(100%);
    opacity: 0.55;
    transition: filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  }
  .group:hover .brand-logo-img {
    filter: grayscale(0%);
    opacity: 1;
    transform: scale(1.08);
  }
`;

/* ─────────────────────────────────────────────────────────────────
 * BrandCard
 * ───────────────────────────────────────────────────────────────── */
const BrandCard = memo(function BrandCard({ brand }) {
  return (
    <motion.li
      variants={itemVariants}
      className="group relative shrink-0 snap-start w-full lg:w-[156px] xl:w-auto xl:flex-1 xl:min-w-0"
    >
      <Link
        to={brand.link}
        aria-label={`Shop ${brand.name} — ${brand.count} products`}
        className="
          relative flex flex-col items-center justify-center
          rounded-2xl
          py-5 px-3 sm:py-6 sm:px-4
          min-h-[118px] sm:min-h-[140px] lg:min-h-[156px]
          transition-[transform,box-shadow,border-color,background-color]
          duration-300 ease-out
          hover:-translate-y-1
          outline-none focus:outline-none focus-visible:outline-none
          will-change-transform
        "
        style={{
          background: palette.surfaceRaised,
          border: `1px solid ${palette.border}`,
          color: palette.ink,
          boxShadow: `0 1px 2px ${palette.shadowSm}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 16px 32px -14px ${palette.shadowLg}, 0 6px 14px -6px ${palette.accentRing}`;
          e.currentTarget.style.borderColor = palette.accentRing;
          e.currentTarget.style.background = palette.surface;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 1px 2px ${palette.shadowSm}`;
          e.currentTarget.style.borderColor = palette.border;
          e.currentTarget.style.background = palette.surfaceRaised;
        }}
      >
        {/* Logo */}
        <span
          className="
            flex items-center justify-center
            w-[clamp(48px,7vw,64px)]
            h-[clamp(48px,7vw,64px)]
            transition-transform duration-300 ease-out
            group-hover:scale-110
          "
          aria-hidden="true"
        >
          <img
            src={brand.logo}
            alt=""
            loading="lazy"
            decoding="async"
            className="brand-logo-img w-full h-full object-contain"
          />
        </span>

        {/* Label */}
        <h3
          className="
            cat-hd-sans
            mt-2.5 sm:mt-3
            font-semibold
            tracking-[-0.01em]
            text-[12.5px] sm:text-[13.5px] lg:text-[14px]
            text-center leading-tight
            transition-colors duration-200
          "
          style={{ color: palette.ink }}
        >
          {brand.name}
        </h3>

        {/* Count */}
        <p
          className="
            cat-hd-sans cat-hd-num
            mt-0.5
            text-[10px] sm:text-[11px]
            font-medium
            tracking-[0.02em]
            text-center
            tabular-nums
          "
          style={{ color: palette.inkMuted }}
        >
          {brand.count} items
        </p>

        {/* Hover underline */}
        <span
          aria-hidden="true"
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            h-px w-0
            transition-[width] duration-300 ease-out
            group-hover:w-7
          "
          style={{ background: palette.accent }}
        />

        {/* Corner arrow — only on xl where cards are wider */}
        <ArrowRight
          aria-hidden="true"
          className="
            hidden xl:block absolute top-3 right-3
            w-3.5 h-3.5 opacity-0 -translate-x-1
            transition-all duration-300
            group-hover:opacity-70 group-hover:translate-x-0
          "
          style={{ color: palette.accent }}
          strokeWidth={2}
        />
      </Link>
    </motion.li>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ScrollFade
 * ───────────────────────────────────────────────────────────────── */
const ScrollFade = memo(function ScrollFade({ side, show }) {
  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none absolute top-0 bottom-0 z-10 w-12 sm:w-16
        transition-opacity duration-300
        ${side === "left" ? "left-0" : "right-0"}
        ${show ? "opacity-100" : "opacity-0"}
      `}
      style={{
        background:
          side === "left"
            ? `linear-gradient(to right, ${palette.bg}, transparent)`
            : `linear-gradient(to left, ${palette.bg}, transparent)`,
      }}
    />
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ScrollButton
 * ───────────────────────────────────────────────────────────────── */
const ScrollButton = memo(function ScrollButton({
  direction,
  disabled,
  onClick,
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Scroll ${direction}`}
      className="
        inline-flex items-center justify-center
        h-9 w-9 rounded-full
        transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        outline-none focus:outline-none focus-visible:outline-none
        hover:scale-105 active:scale-95
      "
      style={{
        border: `1px solid ${palette.borderStrong}`,
        color: palette.ink,
        background: palette.surfaceRaised,
        boxShadow: `0 1px 2px ${palette.shadowSm}`,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = palette.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.borderStrong;
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
    </button>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * BrandScroller
 * ───────────────────────────────────────────────────────────────── */
const BrandScroller = memo(function BrandScroller({ brands }) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
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

  const scrollBy = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.7, 320);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      {/* Hint row */}
      <div className="hidden lg:flex items-center gap-3 mb-4">
        <span
          className="cat-hd-sans text-[10.5px] tracking-[0.18em] uppercase font-semibold"
          style={{ color: palette.inkMuted }}
        >
          Scroll to explore
        </span>
        <div
          className="h-px flex-1"
          style={{ background: palette.border }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-1.5">
          <ScrollButton
            direction="left"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-1)}
          />
          <ScrollButton
            direction="right"
            disabled={!canScrollRight}
            onClick={() => scrollBy(1)}
          />
        </div>
      </div>

      {/* Scroller */}
      <div className="relative">
        <ScrollFade side="left" show={canScrollLeft} />
        <ScrollFade side="right" show={canScrollRight} />

        <motion.ul
          ref={scrollerRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="
            cat-scroll
            flex flex-nowrap gap-3 lg:gap-4
            overflow-x-auto overflow-y-hidden
            scroll-smooth snap-x snap-mandatory
            pb-3 lg:pb-4
            -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0
            xl:justify-between xl:gap-3
          "
        >
          {brands.map((brand, i) => (
            <BrandCard key={brand.name} brand={brand} index={i} />
          ))}
        </motion.ul>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * BrandGrid — mobile/tablet
 * ───────────────────────────────────────────────────────────────── */
const BrandGrid = memo(function BrandGrid({ brands }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3"
    >
      {brands.map((brand, i) => (
        <BrandCard key={brand.name} brand={brand} index={i} />
      ))}
    </motion.ul>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Category — main
 * ───────────────────────────────────────────────────────────────── */
function Category() {
  const totalItems = useMemo(
    () => BRANDS.reduce((sum, b) => sum + b.count, 0),
    []
  );

  return (
    <section
      className="cat-hd-root w-full min-h-screen"
      style={{
        background: palette.bg,
        color: palette.ink,
      }}
      aria-labelledby="category-heading"
    >
      {/* HD text CSS injected once */}
      <style>{HD_TEXT_CSS}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* ── Header ──────────────────────────────────────── */}
        <header className="flex items-end justify-between gap-4 mb-8 sm:mb-10 lg:mb-12">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          >
            <span
              className="cat-hd-sans inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] mb-3"
              style={{ color: palette.accent }}
            >
              <Sparkles className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
              Shop the brands
            </span>

            <h1
              id="category-heading"
              className="
                cat-hd-serif
                font-medium tracking-[-0.025em] leading-[1.02]
                text-[clamp(1.85rem,5.2vw,3.2rem)]
              "
              style={{ color: palette.ink }}
            >
              Shop by Brand
            </h1>

            <p
              className="cat-hd-sans cat-hd-num mt-2.5 text-[13px] sm:text-sm font-normal"
              style={{ color: palette.inkSoft }}
            >
              {BRANDS.length} iconic labels ·{" "}
              <span style={{ color: palette.ink, fontWeight: 500 }}>
                {totalItems.toLocaleString()}
              </span>{" "}
              products
            </p>
          </motion.div>

          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="hidden sm:block shrink-0"
          >
            <Link
              to="/shop"
              className="
                cat-hd-sans group inline-flex items-center gap-1.5
                text-[13px] font-semibold tracking-[-0.005em]
                transition-opacity hover:opacity-70
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.accent }}
            >
              View all
              <ChevronRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </header>

        {/* ── Mobile + Tablet: grid ───────────────────────── */}
        <div className="lg:hidden">
          <BrandGrid brands={BRANDS} />
        </div>

        {/* ── Desktop: scroller ───────────────────────────── */}
        <div className="hidden lg:block">
          <BrandScroller brands={BRANDS} />
        </div>

        {/* ── Mobile "View all" ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex justify-center mt-8 sm:hidden"
        >
          <Link
            to="/shop"
            className="
              cat-hd-sans group inline-flex items-center gap-1.5
              text-[13px] font-semibold
              transition-opacity hover:opacity-70
              outline-none focus:outline-none focus-visible:focus-visible:outline-none
            "
            style={{ color: palette.accent }}
          >
            View all brands
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
}

export default memo(Category);