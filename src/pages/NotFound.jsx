import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  Compass,
  Feather,
  Sparkles,
  ShoppingBag,
  Heart,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches navbar / hero / footer / login / signup
 * ───────────────────────────────────────────────────────────────── */
const palette = {
  bg: "#FFFFFF",
  bgAlt: "#FAFAFA",
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
  danger: "#EF4444",
  warning: "#F59E0B",
};

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .nf-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .nf-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 96;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .nf-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .nf-hd-num { font-variant-numeric: tabular-nums; }
  @keyframes nf-float-slow {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-6px, -8px) rotate(6deg); }
  }
  @keyframes nf-float-rev {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(6px, -6px) rotate(-6deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .nf-float-slow, .nf-float-rev, .nf-breathe {
      animation: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────────────────────────
 * QUICK LINKS — real routes for your store
 * ───────────────────────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: "New Arrivals", to: "/new" },
  { label: "Women", to: "/shop?category=Women" },
  { label: "Men", to: "/shop?category=Men" },
  { label: "Sale", to: "/sale", isSale: true },
  { label: "Contact", to: "/contact" },
];

const SUGGESTED_SEARCHES = [
  "Wool coat",
  "Cashmere",
  "Leather bag",
  "Chelsea boots",
  "Silk dress",
];

/* ─────────────────────────────────────────────────────────────────
 * FloatingShape — decorative, parallax-aware
 * ───────────────────────────────────────────────────────────────── */
const FloatingShape = memo(function FloatingShape({
  variant,
  className,
  style,
  mouseX,
  mouseY,
  depth = 0.5,
  delay = 0,
}) {
  const transform = `translate3d(${mouseX * depth}px, ${mouseY * depth}px, 0)`;

  const shape = useMemo(() => {
    switch (variant) {
      case "ring":
        return (
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
            style={{ border: `2px solid ${palette.accent}`, opacity: 0.08 }}
          />
        );
      case "square":
        return (
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl rotate-12"
            style={{ border: `2px solid ${palette.gold}`, opacity: 0.12 }}
          />
        );
      case "dot":
        return (
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: palette.accent, opacity: 0.2 }}
          />
        );
      case "dot-gold":
        return (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: palette.gold, opacity: 0.25 }}
          />
        );
      case "cross":
        return (
          <div className="relative w-8 h-8" style={{ opacity: 0.12 }}>
            <span
              className="absolute top-1/2 left-0 right-0 h-px"
              style={{ background: palette.accent }}
            />
            <span
              className="absolute top-0 bottom-0 left-1/2 w-px"
              style={{ background: palette.accent }}
            />
          </div>
        );
      default:
        return null;
    }
  }, [variant]);

  const animationClass = variant === "square" ? "nf-float-rev" : "nf-float-slow";

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none will-change-transform transition-transform duration-300 ease-out ${className} ${animationClass}`}
      style={{
        ...style,
        transform,
        animationDelay: `${delay}s`,
        animationDuration: "9s",
      }}
    >
      {shape}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Parallax hook — rAF-throttled, disabled on touch + reduced motion
 * ───────────────────────────────────────────────────────────────── */
const useParallax = (enabled = true) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const mq = window.matchMedia?.("(pointer: fine)");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq?.matches || reduced?.matches) return;

    const handleMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetRef.current = {
        x: ((e.clientX - cx) / cx) * 16,
        y: ((e.clientY - cy) / cy) * 16,
      };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setOffset(targetRef.current);
        rafRef.current = null;
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  return offset;
};

/* ─────────────────────────────────────────────────────────────────
 * NotFound — main
 * ───────────────────────────────────────────────────────────────── */
function NotFound() {
  const navigate = useNavigate();
  const { x: mouseX, y: mouseY } = useParallax(true);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="nf-hd-root relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <style>{HD_CSS}</style>

      {/* Ambient blobs — neutral + subtle amber */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full filter blur-3xl opacity-[0.06]"
          style={{ background: palette.accent }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full filter blur-3xl opacity-[0.05]"
          style={{ background: palette.gold }}
        />
      </div>

      {/* Floating geometric shapes */}
      <FloatingShape
        variant="ring"
        className="top-[12%] left-[8%] hidden sm:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.7}
        delay={0}
      />
      <FloatingShape
        variant="square"
        className="bottom-[14%] right-[8%] hidden sm:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={-0.5}
        delay={1.5}
      />
      <FloatingShape
        variant="cross"
        className="top-[22%] right-[15%] hidden md:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.4}
        delay={0.8}
      />
      <FloatingShape
        variant="dot"
        className="top-[35%] left-[18%] hidden md:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.9}
        delay={2.2}
      />
      <FloatingShape
        variant="dot-gold"
        className="bottom-[28%] left-[12%] hidden lg:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={-0.6}
        delay={1.1}
      />
      <FloatingShape
        variant="dot-gold"
        className="top-[18%] right-[38%] hidden lg:block"
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.5}
        delay={1.9}
      />

      {/* Content */}
      <motion.section
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        aria-labelledby="notfound-heading"
        className="relative z-10 w-full max-w-2xl mx-auto px-5 sm:px-6 py-12 text-center"
      >
        {/* Brand mark */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <Feather
            className="h-5 w-5"
            style={{ color: palette.ink }}
            strokeWidth={2}
          />
          <span
            className="nf-hd-serif text-xl font-medium tracking-tighter"
            style={{ color: palette.ink }}
          >
            Feathered
            <span style={{ color: palette.gold }}>.</span>
          </span>
        </motion.div>

        {/* Error chip */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <span
            className="
              nf-hd-sans inline-flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              text-[10.5px] font-semibold uppercase tracking-[0.2em]
            "
            style={{
              background: palette.surfaceSoft,
              color: palette.inkSoft,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: palette.danger }}
              aria-hidden="true"
            />
            Error 404
          </span>
        </motion.div>

        {/* Big 404 */}
        <motion.div
          variants={numberVariants}
          className="relative inline-block mb-6 sm:mb-8 select-none"
        >
          <span
            className="
              nf-hd-serif nf-hd-num
              block
              text-[clamp(6rem,20vw,12rem)]
              leading-[0.85]
              font-medium
              tracking-[-0.05em]
            "
            style={{
              background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.inkSoft} 60%, ${palette.gold} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>

          {/* Glow underneath */}
          <span
            aria-hidden="true"
            className="
              absolute inset-0 flex items-center justify-center
              text-[clamp(6rem,20vw,12rem)]
              leading-[0.85]
              font-medium
              tracking-[-0.05em]
              blur-2xl opacity-[0.12]
              nf-hd-serif nf-hd-num
              nf-breathe
              pointer-events-none
            "
            style={{
              color: palette.gold,
              animation: "nf-float-slow 6s ease-in-out infinite",
            }}
          >
            404
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          id="notfound-heading"
          className="
            nf-hd-serif
            text-[clamp(1.5rem,4vw,2.25rem)]
            font-medium tracking-[-0.025em] leading-[1.1]
          "
          style={{ color: palette.ink }}
        >
          This page has wandered off.
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="
            nf-hd-sans
            mt-4
            text-[14px] sm:text-[15px]
            leading-relaxed
            max-w-md mx-auto
          "
          style={{ color: palette.inkSoft }}
        >
          The link may be broken, or the page may have been moved. Let's get
          you back to something beautiful.
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
        >
          <Link
            to="/"
            className="
              nf-hd-sans group
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              h-12 px-6
              rounded-full
              text-[13.5px] font-semibold tracking-[-0.005em]
              text-white
              transition-[background-color,transform,box-shadow]
              duration-200
              active:scale-[0.99]
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{
              background: palette.accent,
              boxShadow: `0 8px 20px -10px ${palette.accent}80, 0 2px 6px -2px rgba(0,0,0,0.15)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = palette.accentDeep;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = palette.accent;
            }}
          >
            <Home className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            Back to home
          </Link>

          <Link
            to="/shop"
            className="
              nf-hd-sans group
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              h-12 px-6
              rounded-full
              text-[13.5px] font-semibold tracking-[-0.005em]
              transition-[background-color,transform]
              duration-200
              active:scale-[0.99]
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{
              background: palette.surfaceSoft,
              color: palette.ink,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#EBEBEB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = palette.surfaceSoft;
            }}
          >
            <Compass className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            Browse the shop
          </Link>
        </motion.div>

        {/* Back button */}
        <motion.div variants={itemVariants} className="mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="
              nf-hd-sans
              inline-flex items-center gap-1.5
              text-[12.5px] font-medium
              transition-opacity hover:opacity-70
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{ color: palette.inkSoft }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
            Or go back to the previous page
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8"
          style={{ borderTop: `1px solid ${palette.border}` }}
        >
          {/* Suggested searches */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search
              className="h-3.5 w-3.5"
              style={{ color: palette.inkMuted }}
              strokeWidth={2}
              aria-hidden="true"
            />
            <p
              className="nf-hd-sans text-[11.5px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: palette.inkMuted }}
            >
              Try searching for
            </p>
          </div>

          <ul className="flex flex-wrap justify-center gap-2 mb-10">
            {SUGGESTED_SEARCHES.map((term) => (
              <li key={term}>
                <Link
                  to={`/shop?q=${encodeURIComponent(term)}`}
                  className="
                    nf-hd-sans
                    inline-block
                    px-3.5 py-1.5
                    rounded-full
                    text-[12.5px] font-medium
                    transition-colors duration-200
                    outline-none focus:outline-none focus-visible:outline-none
                  "
                  style={{
                    background: palette.surfaceSoft,
                    color: palette.inkSoft,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = palette.surface;
                    e.currentTarget.style.color = palette.ink;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.border}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.surfaceSoft;
                    e.currentTarget.style.color = palette.inkSoft;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles
              className="h-3.5 w-3.5"
              style={{ color: palette.gold }}
              strokeWidth={2}
              aria-hidden="true"
            />
            <p
              className="nf-hd-sans text-[11.5px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: palette.inkMuted }}
            >
              Or jump to
            </p>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="
                    nf-hd-sans
                    inline-flex items-center gap-1.5
                    text-[13px] font-medium
                    transition-colors duration-200
                    outline-none focus:outline-none focus-visible:outline-none
                  "
                  style={{
                    color: link.isSale ? palette.danger : palette.inkSoft,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = link.isSale
                      ? palette.danger
                      : palette.ink;
                    e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = link.isSale
                      ? palette.danger
                      : palette.inkSoft;
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Trust line */}
        <motion.p
          variants={itemVariants}
          className="
            nf-hd-sans
            mt-12
            text-[11px]
            flex items-center justify-center gap-2
          "
          style={{ color: palette.inkMuted }}
        >
          <Mail className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
          Still lost? Email us at{" "}
          <a
            href="mailto:care@feathered.com"
            className="underline underline-offset-2 hover:no-underline outline-none focus:outline-none focus-visible:outline-none"
            style={{ color: palette.inkSoft }}
          >
            care@feathered.com
          </a>
        </motion.p>
      </motion.section>
    </motion.main>
  );
}

export default memo(NotFound);