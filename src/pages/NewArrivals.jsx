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
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Heart,
  ShoppingBag,
  Star,
  LayoutGrid,
  List,
  ArrowRight,
  Filter,
  Sparkles,
  Package,
  Ruler,
  Box,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches navbar / home / footer
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
  borderStrong: "#D4D4D4",
  accent: "#171717",
  accentDeep: "#0A0A0A",
  gold: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
};

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .na-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .na-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 48;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .na-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .na-hd-num { font-variant-numeric: tabular-nums; }
  .na-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .na-scroll::-webkit-scrollbar-track { background: transparent; }
  .na-scroll::-webkit-scrollbar-thumb {
    background: #D4D4D4;
    border-radius: 9999px;
  }
  .na-scroll::-webkit-scrollbar-thumb:hover { background: #A3A3A3; }
`;

/* ─────────────────────────────────────────────────────────────────
 * SAMPLE PRODUCT DATA — every pair is UNIQUE with a SINGLE SIZE
 * (replace with your API — each shoe will have its own specific size)
 * ───────────────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "s1",
    name: "Air Max 90 'Infrared'",
    brand: "Nike",
    category: "Sneakers",
    subCategory: "Running",
    price: 189,
    compareAt: 240,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Nike Air Max 90 Infrared",
    hoverImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.9,
    reviews: 128,
    colors: ["#FFFFFF", "#1A1A1A", "#EF4444"],
    size: "US 10", // unique single size
    condition: "Deadstock",
    isNew: true,
    createdAt: 12,
  },
  {
    id: "s2",
    name: "Samba OG 'Cloud White'",
    brand: "Adidas",
    category: "Sneakers",
    subCategory: "Casual",
    price: 110,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Adidas Samba OG Cloud White",
    hoverImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.8,
    reviews: 342,
    colors: ["#F5F5F5", "#1A1A1A", "#8B5A3C"],
    size: "US 9",
    condition: "Deadstock",
    isNew: true,
    createdAt: 11,
  },
  {
    id: "s3",
    name: "Suede Classic XXI",
    brand: "Puma",
    category: "Sneakers",
    subCategory: "Casual",
    price: 75,
    compareAt: 95,
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Puma Suede Classic XXI",
    hoverImage: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.7,
    reviews: 89,
    colors: ["#1A1A1A", "#EF4444", "#FFFFFF"],
    size: "US 11",
    condition: "Like New",
    isNew: true,
    createdAt: 10,
  },
  {
    id: "s4",
    name: "574 Core 'Grey'",
    brand: "New Balance",
    category: "Running",
    subCategory: "Lifestyle",
    price: 89,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80&auto=format&fit=crop",
    imageAlt: "New Balance 574 Core Grey",
    hoverImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 5.0,
    reviews: 56,
    colors: ["#8B8B8B", "#1A1A1A"],
    size: "US 10.5",
    condition: "Deadstock",
    isNew: true,
    createdAt: 9,
  },
  {
    id: "s5",
    name: "Chuck 70 Hi 'Black'",
    brand: "Converse",
    category: "Sneakers",
    subCategory: "High-Top",
    price: 85,
    compareAt: 110,
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Converse Chuck 70 Hi Black",
    hoverImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.9,
    reviews: 201,
    colors: ["#1A1A1A", "#FFFFFF", "#EF4444"],
    size: "US 8.5",
    condition: "Deadstock",
    isNew: true,
    createdAt: 8,
  },
  {
    id: "s6",
    name: "Old Skool 'Checkerboard'",
    brand: "Vans",
    category: "Sneakers",
    subCategory: "Skate",
    price: 65,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Vans Old Skool Checkerboard",
    hoverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.6,
    reviews: 74,
    colors: ["#1A1A1A", "#FFFFFF"],
    size: "US 9.5",
    condition: "Like New",
    isNew: true,
    createdAt: 7,
  },
  {
    id: "s7",
    name: "Classic Leather 'White'",
    brand: "Reebok",
    category: "Sneakers",
    subCategory: "Casual",
    price: 70,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Reebok Classic Leather White",
    hoverImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.8,
    reviews: 156,
    colors: ["#FFFFFF", "#1A1A1A", "#10B981"],
    size: "US 10",
    condition: "Deadstock",
    isNew: true,
    createdAt: 6,
  },
  {
    id: "s8",
    name: "Air Jordan 1 Mid 'Chicago'",
    brand: "Jordan",
    category: "Basketball",
    subCategory: "Retro",
    price: 320,
    compareAt: 420,
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Air Jordan 1 Mid Chicago",
    hoverImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format&fit=crop",
    badge: "Rare",
    rating: 5.0,
    reviews: 89,
    colors: ["#EF4444", "#FFFFFF", "#1A1A1A"],
    size: "US 11.5",
    condition: "Deadstock",
    isNew: true,
    createdAt: 5,
  },
  {
    id: "s9",
    name: "Gel-Kayano 14 'Silver'",
    brand: "Asics",
    category: "Running",
    subCategory: "Performance",
    price: 145,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Asics Gel-Kayano 14 Silver",
    hoverImage: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.7,
    reviews: 92,
    colors: ["#C0C0C0", "#1A1A1A", "#8B5A3C"],
    size: "US 9",
    condition: "Deadstock",
    isNew: true,
    createdAt: 4,
  },
  {
    id: "s10",
    name: "6-Inch Premium Boot 'Wheat'",
    brand: "Timberland",
    category: "Boots",
    subCategory: "Workwear",
    price: 198,
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Timberland 6-Inch Premium Wheat",
    hoverImage: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.9,
    reviews: 118,
    colors: ["#C29B5B", "#8B5A3C"],
    size: "US 10",
    condition: "Like New",
    isNew: true,
    createdAt: 3,
  },
  {
    id: "s11",
    name: "1460 Pascal Boot 'Black'",
    brand: "Dr. Martens",
    category: "Boots",
    subCategory: "Combat",
    price: 170,
    compareAt: 200,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Dr. Martens 1460 Pascal Black",
    hoverImage: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.6,
    reviews: 67,
    colors: ["#1A1A1A"],
    size: "US 8",
    condition: "Deadstock",
    isNew: true,
    createdAt: 2,
  },
  {
    id: "s12",
    name: "XT-6 'Vanilla Ice'",
    brand: "Salomon",
    category: "Running",
    subCategory: "Trail",
    price: 195,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Salomon XT-6 Vanilla Ice",
    hoverImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.8,
    reviews: 84,
    colors: ["#E5D5C0", "#1A1A1A"],
    size: "US 10.5",
    condition: "Deadstock",
    isNew: true,
    createdAt: 1,
  },
  {
    id: "s13",
    name: "Clifton 9 'All Black'",
    brand: "Hoka",
    category: "Running",
    subCategory: "Performance",
    price: 145,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Hoka Clifton 9 All Black",
    hoverImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.7,
    reviews: 45,
    colors: ["#1A1A1A"],
    size: "US 9.5",
    condition: "Deadstock",
    isNew: true,
    createdAt: 0,
  },
  {
    id: "s14",
    name: "Disruptor II 'White'",
    brand: "Fila",
    category: "Sneakers",
    subCategory: "Chunky",
    price: 75,
    compareAt: 95,
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Fila Disruptor II White",
    hoverImage: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80&auto=format&fit=crop",
    badge: "New",
    rating: 4.5,
    reviews: 48,
    colors: ["#FFFFFF"],
    size: "US 7.5",
    condition: "Like New",
    isNew: true,
    createdAt: -1,
  },
];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Sneakers", value: "Sneakers" },
  { label: "Running", value: "Running" },
  { label: "Basketball", value: "Basketball" },
  { label: "Boots", value: "Boots" },
];

const SIZE_FILTERS = [
  { label: "All sizes", value: "all" },
  { label: "US 7 – 8", value: "7-8" },
  { label: "US 8.5 – 9.5", value: "8.5-9.5" },
  { label: "US 10 – 11", value: "10-11" },
  { label: "US 11.5+", value: "11.5+" },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to high", value: "price-asc" },
  { label: "Price: High to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
];

const PRICE_RANGES = [
  { label: "All prices", value: "all", min: 0, max: Infinity },
  { label: "Under $100", value: "0-100", min: 0, max: 100 },
  { label: "$100 – $200", value: "100-200", min: 100, max: 200 },
  { label: "$200 – $300", value: "200-300", min: 200, max: 300 },
  { label: "Over $300", value: "300+", min: 300, max: Infinity },
];

const ITEMS_PER_PAGE = 8;

/* ─────────────────────────────────────────────────────────────────
 * UTILITIES
 * ───────────────────────────────────────────────────────────────── */
const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "$0";
  return `$${num}`;
};

const getDiscount = (price, compareAt) => {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
};

/* Match a shoe's single size against a size-range filter */
const matchesSizeRange = (sizeStr, rangeValue) => {
  if (rangeValue === "all") return true;
  const numMatch = sizeStr.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return false;
  const size = parseFloat(numMatch[1]);

  switch (rangeValue) {
    case "7-8":
      return size >= 7 && size <= 8;
    case "8.5-9.5":
      return size >= 8.5 && size <= 9.5;
    case "10-11":
      return size >= 10 && size <= 11;
    case "11.5+":
      return size >= 11.5;
    default:
      return true;
  }
};

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ─────────────────────────────────────────────────────────────────
 * FilterPanelContent — shared between desktop sidebar & mobile drawer
 * ───────────────────────────────────────────────────────────────── */
const FilterPanelContent = memo(function FilterPanelContent({
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sizeRange,
  setSizeRange,
  onClear,
  activeCount,
}) {
  const Section = ({ title, children }) => (
    <div className="py-5 first:pt-0" style={{ borderBottom: `1px solid ${palette.border}` }}>
      <h3
        className="na-hd-sans text-[11px] font-bold uppercase tracking-[0.15em] mb-3"
        style={{ color: palette.ink }}
      >
        {title}
      </h3>
      {children}
    </div>
  );

  const RadioOption = ({ label, checked, onChange }) => (
    <label
      className="
        na-hd-sans flex items-center gap-2.5 py-1.5
        text-[13.5px] cursor-pointer select-none
        transition-colors
      "
      style={{ color: checked ? palette.ink : palette.inkSoft }}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          className="h-[16px] w-[16px] rounded-full flex items-center justify-center transition-colors"
          style={{
            background: checked ? palette.accent : palette.surfaceSoft,
          }}
        >
          <span
            className="h-[6px] w-[6px] rounded-full transition-opacity"
            style={{
              background: "#FFFFFF",
              opacity: checked ? 1 : 0,
            }}
          />
        </span>
      </span>
      {label}
    </label>
  );

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: palette.ink }} strokeWidth={2} />
          <h2
            className="na-hd-sans text-[14px] font-semibold tracking-[-0.005em]"
            style={{ color: palette.ink }}
          >
            Filters
          </h2>
          {activeCount > 0 && (
            <span
              className="na-hd-sans na-hd-num inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
              style={{ background: palette.accent, color: "#FFFFFF" }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="
              na-hd-sans text-[12px] font-medium
              transition-opacity hover:opacity-70
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{ color: palette.inkSoft }}
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Category">
        <div className="flex flex-col">
          {CATEGORIES.map((c) => (
            <RadioOption
              key={c.value}
              label={c.label}
              checked={category === c.value}
              onChange={() => setCategory(c.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Size (single size per pair)">
        <div className="flex flex-col">
          {SIZE_FILTERS.map((s) => (
            <RadioOption
              key={s.value}
              label={s.label}
              checked={sizeRange === s.value}
              onChange={() => setSizeRange(s.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Price">
        <div className="flex flex-col">
          {PRICE_RANGES.map((p) => (
            <RadioOption
              key={p.value}
              label={p.label}
              checked={priceRange === p.value}
              onChange={() => setPriceRange(p.value)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ProductCard — grid & list variants
 * ───────────────────────────────────────────────────────────────── */
const ProductCard = memo(function ProductCard({ product, view = "grid", index = 0 }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const discount = getDiscount(product.price, product.compareAt);

  const handleAdd = useCallback(() => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }, []);

  /* ── List view ── */
  if (view === "list") {
    return (
      <motion.article
        variants={cardVariants}
        layout
        className="
          group relative flex gap-4 sm:gap-5
          p-3 sm:p-4 rounded-2xl
          transition-colors
        "
        style={{ background: palette.surface }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = palette.surfaceSoft;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = palette.surface;
        }}
      >
        {/* Image */}
        <Link
          to={`/product/${product.id}`}
          className="
            relative shrink-0
            w-24 h-32 sm:w-32 sm:h-40 lg:w-40 lg:h-52
            rounded-xl overflow-hidden
            outline-none focus:outline-none focus-visible:outline-none
          "
          style={{ background: palette.surfaceSoft }}
        >
          <img
            src={product.image}
            alt={product.imageAlt || product.name}
            loading={index < 4 ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {product.badge && (
            <span
              className="
                absolute top-2 left-2
                na-hd-sans
                inline-flex items-center px-2 py-0.5
                rounded-full text-[9.5px] font-bold uppercase tracking-wider
              "
              style={{ background: palette.accent, color: "#FFFFFF" }}
            >
              {product.badge}
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 py-1">
          <div>
            <p
              className="na-hd-sans text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{ color: palette.inkMuted }}
            >
              {product.brand} · {product.subCategory}
            </p>
            <Link
              to={`/product/${product.id}`}
              className="
                na-hd-sans block mt-1
                text-[15px] sm:text-base font-semibold
                hover:opacity-70 transition-opacity
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.ink }}
            >
              {product.name}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {/* Unique single size chip */}
              <span
                className="
                  na-hd-sans inline-flex items-center gap-1
                  px-2 py-0.5 rounded-md
                  text-[10.5px] font-semibold tracking-wide
                "
                style={{
                  background: palette.surfaceSoft,
                  color: palette.ink,
                }}
              >
                <Ruler className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
                {product.size}
              </span>

              {/* Condition chip */}
              {product.condition && (
                <span
                  className="
                    na-hd-sans inline-flex items-center gap-1
                    px-2 py-0.5 rounded-md
                    text-[10.5px] font-semibold tracking-wide
                  "
                  style={{
                    background:
                      product.condition === "Deadstock"
                        ? `${palette.success}15`
                        : `${palette.gold}15`,
                    color:
                      product.condition === "Deadstock"
                        ? palette.success
                        : palette.gold,
                  }}
                >
                  <Box className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
                  {product.condition}
                </span>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3"
                      strokeWidth={0}
                      style={{
                        fill:
                          i < Math.round(product.rating)
                            ? palette.gold
                            : palette.border,
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span
                  className="na-hd-sans na-hd-num text-[11.5px]"
                  style={{ color: palette.inkMuted }}
                >
                  {product.rating} · {product.reviews}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span
                className="na-hd-sans na-hd-num text-lg font-semibold tabular-nums"
                style={{ color: palette.ink }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAt && (
                <span
                  className="na-hd-sans na-hd-num text-[13px] line-through tabular-nums"
                  style={{ color: palette.inkMuted }}
                >
                  {formatPrice(product.compareAt)}
                </span>
              )}
              {discount > 0 && (
                <span
                  className="na-hd-sans text-[11px] font-bold"
                  style={{ color: palette.danger }}
                >
                  −{discount}%
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWishlisted((v) => !v)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
                className="
                  inline-flex items-center justify-center
                  h-9 w-9 rounded-full
                  transition-colors
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{
                  background: palette.surfaceSoft,
                  color: wishlisted ? palette.danger : palette.inkSoft,
                }}
              >
                <Heart
                  className="h-4 w-4"
                  strokeWidth={2}
                  style={{ fill: wishlisted ? palette.danger : "transparent" }}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="
                  na-hd-sans
                  inline-flex items-center justify-center gap-1.5
                  h-9 px-4 rounded-full
                  text-[12.5px] font-semibold
                  transition-colors
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{
                  background: added ? palette.success : palette.accent,
                  color: "#FFFFFF",
                }}
              >
                {added ? (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Add to bag
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  /* ── Grid variant ── */
  return (
    <motion.article
      variants={cardVariants}
      layout
      className="group relative flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        aria-label={product.name}
        className="
          relative block aspect-[3/4] rounded-2xl overflow-hidden
          outline-none focus:outline-none focus-visible:outline-none
        "
        style={{ background: palette.surfaceSoft }}
      >
        <img
          src={product.image}
          alt={product.imageAlt || product.name}
          loading={index < 4 ? "eager" : "lazy"}
          className="
            absolute inset-0 w-full h-full object-cover
            transition-opacity duration-500
          "
          style={{ opacity: hovering && product.hoverImage ? 0 : 1 }}
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="
              absolute inset-0 w-full h-full object-cover
              transition-opacity duration-500
            "
            style={{ opacity: hovering ? 1 : 0 }}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
          {product.badge && (
            <span
              className="
                na-hd-sans
                inline-flex items-center px-2 py-1
                rounded-full text-[10px] font-bold uppercase tracking-wider
              "
              style={{ background: palette.accent, color: "#FFFFFF" }}
            >
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span
              className="
                na-hd-sans
                inline-flex items-center px-2 py-1
                rounded-full text-[10px] font-bold uppercase tracking-wider
              "
              style={{ background: palette.danger, color: "#FFFFFF" }}
            >
              −{discount}%
            </span>
          )}
          {product.condition === "Deadstock" && (
            <span
              className="
                na-hd-sans
                inline-flex items-center gap-1 px-2 py-1
                rounded-full text-[10px] font-bold uppercase tracking-wider
                backdrop-blur-md
              "
              style={{
                background: "rgba(255,255,255,0.9)",
                color: palette.success,
              }}
            >
              <Box className="h-2.5 w-2.5" strokeWidth={2.75} aria-hidden="true" />
              DS
            </span>
          )}
        </div>

        {/* Unique single size badge — top-right below wishlist */}
        <div
          className="
            absolute bottom-3 left-3
            pointer-events-none
            na-hd-sans
            inline-flex items-center gap-1.5
            px-2.5 py-1 rounded-full
            text-[11px] font-bold tracking-wide
            backdrop-blur-md
          "
          style={{
            background: "rgba(255,255,255,0.92)",
            color: palette.ink,
          }}
        >
          <Ruler className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
          {product.size}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((v) => !v);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="
            absolute top-3 right-3
            inline-flex items-center justify-center
            h-9 w-9 rounded-full
            backdrop-blur-md
            transition-colors
            outline-none focus:outline-none focus-visible:outline-none
          "
          style={{
            background: "rgba(255,255,255,0.9)",
            color: wishlisted ? palette.danger : palette.inkSoft,
          }}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={2}
            style={{ fill: wishlisted ? palette.danger : "transparent" }}
            aria-hidden="true"
          />
        </button>

        {/* Quick add */}
        <div
          className={`
            absolute inset-x-3 bottom-3
            transition-[transform,opacity] duration-300 ease-out
            ${hovering ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"}
          `}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="
              na-hd-sans
              w-full h-10 inline-flex items-center justify-center gap-2
              rounded-full
              text-[12.5px] font-semibold
              transition-colors
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{
              background: added ? palette.success : palette.accent,
              color: "#FFFFFF",
            }}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                Added to bag
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
                Quick add
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Meta */}
      <div className="pt-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${product.id}`}
              className="
                na-hd-sans block
                text-[13.5px] font-semibold tracking-[-0.005em]
                truncate
                hover:opacity-70 transition-opacity
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.ink }}
            >
              {product.name}
            </Link>
            <p
              className="na-hd-sans text-[11px] mt-0.5 truncate"
              style={{ color: palette.inkMuted }}
            >
              {product.brand} · {product.subCategory}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p
              className="na-hd-sans na-hd-num text-[14px] font-semibold tabular-nums"
              style={{ color: palette.ink }}
            >
              {formatPrice(product.price)}
            </p>
            {product.compareAt && (
              <p
                className="na-hd-sans na-hd-num text-[11px] line-through tabular-nums"
                style={{ color: palette.inkMuted }}
              >
                {formatPrice(product.compareAt)}
              </p>
            )}
          </div>
        </div>

        {/* Colors + rating */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1">
            {product.colors?.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full ring-1 ring-offset-1"
                style={{
                  background: c,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                }}
                aria-hidden="true"
              />
            ))}
            {product.colors?.length > 4 && (
              <span
                className="na-hd-sans na-hd-num text-[10.5px] ml-0.5"
                style={{ color: palette.inkMuted }}
              >
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-1 na-hd-sans na-hd-num text-[11px]"
            style={{ color: palette.inkSoft }}
          >
            <Star
              className="h-3 w-3"
              strokeWidth={0}
              style={{ fill: palette.gold }}
              aria-hidden="true"
            />
            {product.rating.toFixed(1)}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * SkeletonCard — loading placeholder
 * ───────────────────────────────────────────────────────────────── */
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div
        className="aspect-[3/4] rounded-2xl"
        style={{ background: palette.surfaceSoft }}
      />
      <div className="space-y-2">
        <div
          className="h-3 w-3/4 rounded"
          style={{ background: palette.surfaceSoft }}
        />
        <div
          className="h-2.5 w-1/2 rounded"
          style={{ background: palette.surfaceSoft }}
        />
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * SortDropdown
 * ───────────────────────────────────────────────────────────────── */
const SortDropdown = memo(function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort products"
        className="
          na-hd-sans
          inline-flex items-center gap-2
          h-10 pl-4 pr-3 rounded-full
          text-[12.5px] font-semibold tracking-[-0.005em]
          transition-colors
          outline-none focus:outline-none focus-visible:outline-none
        "
        style={{
          background: palette.surfaceSoft,
          color: palette.ink,
        }}
      >
        <span className="hidden sm:inline" style={{ color: palette.inkMuted }}>
          Sort:
        </span>
        <span className="truncate">{current?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-full mt-2
              w-52 z-30
              rounded-2xl overflow-hidden py-1
            "
            style={{
              background: palette.surface,
              boxShadow: `0 20px 40px -20px rgba(0,0,0,0.18), 0 0 0 1px ${palette.border}`,
            }}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="
                      na-hd-sans
                      w-full flex items-center justify-between gap-2
                      px-3.5 py-2 text-left text-[13px]
                      transition-colors
                      outline-none focus:outline-none focus-visible:outline-none
                    "
                    style={{
                      background: active ? palette.surfaceSoft : "transparent",
                      color: active ? palette.ink : palette.inkSoft,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {opt.label}
                    {active && (
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ViewToggle
 * ───────────────────────────────────────────────────────────────── */
const ViewToggle = memo(function ViewToggle({ value, onChange }) {
  return (
    <div
      className="inline-flex items-center p-1 rounded-full shrink-0"
      style={{ background: palette.surfaceSoft }}
      role="tablist"
      aria-label="Product view"
    >
      {[
        { icon: LayoutGrid, label: "grid", aria: "Grid view" },
        { icon: List, label: "list", aria: "List view" },
      ].map(({ icon: Icon, label, aria }) => {
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={aria}
            onClick={() => onChange(label)}
            className="
              inline-flex items-center justify-center
              h-8 w-8 rounded-full
              transition-colors
              outline-none focus:outline-none focus-visible:outline-none
            "
            style={{
              background: active ? palette.surface : "transparent",
              color: active ? palette.ink : palette.inkMuted,
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * MobileFilterDrawer
 * ───────────────────────────────────────────────────────────────── */
const MobileFilterDrawer = memo(function MobileFilterDrawer({
  isOpen,
  onClose,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sizeRange,
  setSizeRange,
  onClear,
  activeCount,
  resultCount,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: "rgba(23,23,23,0.5)", backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="
              fixed inset-y-0 right-0 z-50
              w-full max-w-sm lg:hidden
              flex flex-col
            "
            style={{ background: palette.surface }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: palette.border }}>
              <h2
                className="na-hd-sans text-[15px] font-semibold"
                style={{ color: palette.ink }}
              >
                Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="
                  inline-flex items-center justify-center
                  h-9 w-9 rounded-full
                  transition-colors hover:bg-neutral-100
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{ color: palette.inkSoft }}
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto na-scroll p-5">
              <FilterPanelContent
                category={category}
                setCategory={setCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sizeRange={sizeRange}
                setSizeRange={setSizeRange}
                onClear={onClear}
                activeCount={activeCount}
              />
            </div>

            <div
              className="p-5 border-t"
              style={{ borderColor: palette.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  na-hd-sans
                  w-full h-12 inline-flex items-center justify-center gap-2
                  rounded-full
                  text-[13.5px] font-semibold
                  text-white
                  transition-opacity active:scale-[0.99]
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{
                  background: palette.accent,
                  boxShadow: `0 8px 20px -10px ${palette.accent}80`,
                }}
              >
                Show {resultCount} results
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * EmptyState
 * ───────────────────────────────────────────────────────────────── */
const EmptyState = memo(function EmptyState({ onClear }) {
  return (
    <div className="py-20 sm:py-28 text-center">
      <div
        className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-5"
        style={{ background: palette.surfaceSoft }}
      >
        <Package
          className="h-6 w-6"
          style={{ color: palette.inkMuted }}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      <h3
        className="na-hd-serif text-2xl font-medium tracking-tight"
        style={{ color: palette.ink }}
      >
        No pairs match.
      </h3>
      <p
        className="na-hd-sans mt-2 text-[13.5px] max-w-sm mx-auto"
        style={{ color: palette.inkSoft }}
      >
        Since every pair is unique with a single size, try widening your
        filters to see more options.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="
          na-hd-sans
          mt-6 inline-flex items-center gap-2
          h-11 px-5 rounded-full
          text-[13px] font-semibold
          transition-opacity
          outline-none focus:outline-none focus-visible:outline-none
        "
        style={{ background: palette.accent, color: "#FFFFFF" }}
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        Clear filters
      </button>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * NewArrivals — main
 * ───────────────────────────────────────────────────────────────── */
function NewArrivals() {
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sizeRange, setSizeRange] = useState("all");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [category, priceRange, sizeRange, sort]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (category !== "all") n++;
    if (priceRange !== "all") n++;
    if (sizeRange !== "all") n++;
    return n;
  }, [category, priceRange, sizeRange]);

  /* Filter + sort pipeline */
  const filtered = useMemo(() => {
    const range = PRICE_RANGES.find((p) => p.value === priceRange) || PRICE_RANGES[0];

    let list = PRODUCTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price < range.min || p.price > range.max) return false;
      if (!matchesSizeRange(p.size, sizeRange)) return false;
      return true;
    });

    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [category, priceRange, sizeRange, sort]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const hasMore = visibleCount < filtered.length;

  const handleClear = useCallback(() => {
    setCategory("all");
    setPriceRange("all");
    setSizeRange("all");
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + ITEMS_PER_PAGE);
  }, []);

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="na-hd-root relative w-full min-h-screen"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <style>{HD_CSS}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
        {/* ── Header ─────────────────────────────────────── */}
        <motion.header
          variants={headerVariants}
          className="flex flex-col gap-6 mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="min-w-0">
              <span
                className="na-hd-sans inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: palette.inkMuted }}
              >
                <Sparkles
                  className="h-3 w-3"
                  style={{ color: palette.gold }}
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                Fresh drops · one pair per size
              </span>
              <h1
                className="
                  na-hd-serif
                  text-[clamp(1.9rem,5vw,3rem)]
                  font-medium tracking-[-0.03em] leading-[1.05]
                "
                style={{ color: palette.ink }}
              >
                New Arrivals
              </h1>
              <p
                className="na-hd-sans na-hd-num mt-2 text-[13px] sm:text-sm"
                style={{ color: palette.inkSoft }}
              >
                <span style={{ color: palette.ink, fontWeight: 500 }}>
                  {isLoading ? "—" : filtered.length}
                </span>{" "}
                unique pairs · each in a single size
              </p>
            </div>

            <Link
              to="/shop"
              className="
                na-hd-sans group
                hidden sm:inline-flex items-center gap-1.5
                text-[13px] font-semibold
                transition-opacity hover:opacity-70
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.inkSoft }}
            >
              View all products
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="
                  na-hd-sans
                  lg:hidden inline-flex items-center gap-2
                  h-10 px-4 rounded-full
                  text-[12.5px] font-semibold
                  transition-colors
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{
                  background: palette.surfaceSoft,
                  color: palette.ink,
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.25} />
                Filters
                {activeCount > 0 && (
                  <span
                    className="na-hd-sans na-hd-num inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                    style={{ background: palette.accent, color: "#FFFFFF" }}
                  >
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Desktop quick chips */}
              <div className="hidden lg:flex items-center gap-1.5">
                {CATEGORIES.map((c) => {
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className="
                        na-hd-sans
                        inline-flex items-center
                        h-9 px-3.5 rounded-full
                        text-[12.5px] font-medium
                        transition-colors
                        outline-none focus:outline-none focus-visible:outline-none
                      "
                      style={{
                        background: active ? palette.accent : palette.surfaceSoft,
                        color: active ? "#FFFFFF" : palette.inkSoft,
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <ViewToggle value={view} onChange={setView} />
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>
        </motion.header>

        {/* ── Main layout ─────────────────────────────────── */}
        <div className="flex gap-8 lg:gap-10 items-start">
          {/* Desktop sidebar */}
          <motion.aside
            variants={headerVariants}
            className="
              hidden lg:block
              w-56 xl:w-64 shrink-0
              sticky top-32
              max-h-[calc(100vh-9rem)]
              overflow-y-auto na-scroll pr-1
            "
          >
            <FilterPanelContent
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sizeRange={sizeRange}
              setSizeRange={setSizeRange}
              onClear={handleClear}
              activeCount={activeCount}
            />
          </motion.aside>

          {/* Product area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onClear={handleClear} />
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${view}-${category}-${priceRange}-${sizeRange}-${sort}`}
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                    className={
                      view === "grid"
                        ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
                        : "flex flex-col gap-3 sm:gap-4"
                    }
                  >
                    {visible.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        view={view}
                        index={i}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <p
                      className="na-hd-sans na-hd-num text-[11.5px]"
                      style={{ color: palette.inkMuted }}
                    >
                      Showing {visible.length} of {filtered.length}
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="
                        na-hd-sans group
                        inline-flex items-center gap-2
                        h-12 px-7 rounded-full
                        text-[13.5px] font-semibold
                        transition-[background-color,transform]
                        duration-200
                        active:scale-[0.99]
                        outline-none focus:outline-none focus-visible:outline-none
                      "
                      style={{
                        background: palette.accent,
                        color: "#FFFFFF",
                        boxShadow: `0 8px 20px -10px ${palette.accent}80`,
                      }}
                    >
                      Load more
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        strokeWidth={2.25}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        category={category}
        setCategory={setCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sizeRange={sizeRange}
        setSizeRange={setSizeRange}
        onClear={handleClear}
        activeCount={activeCount}
        resultCount={filtered.length}
      />
    </motion.main>
  );
}

export default memo(NewArrivals);