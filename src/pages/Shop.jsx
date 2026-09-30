/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3x3,
  List,
  Heart,
  ShoppingBag,
  Star,
  Filter,
  Check,
  ArrowUpDown,
  Package,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import useClickOutside from "@/components/hooks/useClickOutside";

/* ─────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────── */
const BRANDS_FALLBACK = [
  "Nike", "Adidas", "Puma", "Reebok", "New Balance", "Under Armour",
  "Asics", "Skechers", "Converse", "Vans", "Clarks", "Dr. Martens",
  "Timberland", "Salomon", "Merrell", "Hoka", "Bata", "Service",
  "Borjan", "Ndure", "Other",
];

const GENDERS = ["Kids", "Men", "Women", "Unisex"];

const SPORTS = [
  "Boots", "Casual", "Cricket", "Football", "Formal", "Padel",
  "Running", "Sandals & Slippers", "Trekking",
];

const CONDITIONS = ["Good", "Very Good", "Excellent", "Premium", "Premium+"];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "popular", label: "Most Popular" },
];

const SIZE_SYSTEMS = {
  Kids: [
    "20", "20.5", "21", "21.5", "22", "22.5", "23", "23.5",
    "24", "24.5", "25", "25.5", "26", "26.5", "27", "27.5",
    "28", "28.5", "29", "29.5", "30", "30.5", "31", "31.5",
    "32", "32.5", "33", "33.5", "34", "34.5", "35",
  ],
  Men: [
    "39", "39.5", "40", "40.5", "41", "41.5", "42", "42.5",
    "43", "43.5", "44", "44.5", "45", "45.5", "46", "46.5",
    "47", "47.5", "48", "48.5", "49", "49.5", "50",
  ],
  Women: [
    "35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5",
    "39", "39.5", "40", "40.5", "41", "41.5", "42", "42.5",
    "43", "43.5", "44",
  ],
  Unisex: [
    "35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5",
    "39", "39.5", "40", "40.5", "41", "41.5", "42", "42.5",
    "43", "43.5", "44", "44.5", "45", "45.5", "46", "46.5",
    "47", "47.5", "48", "48.5", "49", "49.5", "50",
  ],
};

/* ─────────────────────────────────────────────────────────────────
 * UTILITIES
 * ───────────────────────────────────────────────────────────────── */
const formatCurrency = (v) => {
  const num = Number(v);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const discountPercent = (price, original) => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

const normalizeProduct = (p) => ({
  id: p._id,
  _id: p._id,
  name: p.name,
  brand: p.brand,
  gender: p.gender,
  sport: p.sport,
  condition: p.condition,
  price: p.salePrice ?? p.regularPrice,
  originalPrice: p.salePrice ? p.regularPrice : null,
  rating: p.rating ?? 0,
  reviews: p.reviewsCount ?? 0,
  image: p.image,
  isFeatured: p.isFeatured,
  inStock: p.inStock && p.stock > 0,
  stock: p.stock,
  sizes: Array.isArray(p.sizes)
    ? p.sizes.map((s) => (typeof s === "string" ? s : s.size))
    : p.sizeList ?? [],
  shortDescription: p.shortDescription,
  slug: p.slug,
});

/* ─────────────────────────────────────────────────────────────────
 * ProductSkeleton
 * ───────────────────────────────────────────────────────────────── */
const ProductSkeleton = memo(function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden">
      <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-6 w-24 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * StarRating
 * ───────────────────────────────────────────────────────────────── */
const StarRating = memo(function StarRating({ rating = 0, count = 0, size = 12 }) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const partial = !filled && rating > star - 1;
          return (
            <Star
              key={star}
              style={{ width: size, height: size }}
              className={`${
                filled || partial
                  ? "fill-amber-400 text-amber-400"
                  : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
              }`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-[10px] text-neutral-400 font-medium">({count})</span>
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ProductCard
 * ───────────────────────────────────────────────────────────────── */
const ProductCard = memo(function ProductCard({
  product,
  view = "grid",
  index = 0,
  onAddToCart,
  onToggleWishlist,
  wishlisted,
}) {
  const discount = discountPercent(product.price, product.originalPrice);

  const conditionColor = {
    Good: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
    "Very Good": "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    Excellent: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    Premium: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
    "Premium+": "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  }[product.condition] || "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400";

  const imageSlot = (
    <>
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-14 w-14 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
        </div>
      )}

      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {product.condition && (
          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${conditionColor}`}>
            {product.condition}
          </span>
        )}
        {discount > 0 && (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold bg-red-500 text-white">
            -{discount}%
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist?.(product.id);
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
          strokeWidth={2}
        />
      </button>

      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link
          to={`/product/${product.slug || product.id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 text-[11px] font-bold hover:bg-white dark:hover:bg-neutral-800 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
          Quick View
        </Link>
      </div>

      {!product.inStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="px-3 py-1.5 bg-white text-neutral-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Out of Stock
          </span>
        </div>
      )}
    </>
  );

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
        className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <Link
          to={`/product/${product.slug || product.id}`}
          className="relative w-full sm:w-48 shrink-0 aspect-square sm:aspect-auto sm:h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 overflow-hidden"
        >
          {imageSlot}
        </Link>

        <div className="flex-1 flex flex-col justify-between p-4 sm:py-4 sm:pr-5">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                  {product.brand}
                </span>
                <span className="text-[10px] text-neutral-300 dark:text-neutral-600 mx-1.5">·</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                  {product.sport}
                </span>
              </div>
            </div>

            <Link to={`/product/${product.slug || product.id}`}>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            <div className="mt-2">
              <StarRating rating={product.rating} count={product.reviews} size={13} />
            </div>

            {product.shortDescription && (
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-3 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {product.sizes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mr-1">
                  Sizes:
                </span>
                {product.sizes.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    {s}
                  </span>
                ))}
                {product.sizes.length > 6 && (
                  <span className="text-[10px] text-neutral-400">+{product.sizes.length - 6}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through tabular-nums">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => onAddToCart?.(product)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.5} />
              Add to Bag
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
    >
      <Link
        to={`/product/${product.slug || product.id}`}
        className="relative block aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 overflow-hidden"
      >
        {imageSlot}
      </Link>

      <div className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 truncate">
            {product.brand}
          </span>
          <StarRating rating={product.rating} size={11} />
        </div>

        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="text-[13px] sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            {product.gender}
          </span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 truncate">
            {product.sport}
          </span>
        </div>

        {product.sizes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {product.sizes.slice(0, 4).map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                {s}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[10px] text-neutral-400 font-medium">+{product.sizes.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-neutral-400 line-through tabular-nums truncate">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => onAddToCart?.(product)}
            className="shrink-0 p-2 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            aria-label="Add to bag"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * FilterSection
 * ───────────────────────────────────────────────────────────────── */
const FilterSection = memo(function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-1 text-left outline-none focus:outline-none focus-visible:outline-none"
        aria-expanded={open}
      >
        <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-900 dark:text-neutral-100">
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * CheckboxRow
 * ───────────────────────────────────────────────────────────────── */
const CheckboxRow = memo(function CheckboxRow({ label, checked, count, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer group">
      <span className="flex items-center gap-2.5 min-w-0">
        <span className={`relative w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100"
            : "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400"
        }`}>
          {checked && <Check className="h-2.5 w-2.5 text-white dark:text-neutral-900" strokeWidth={3.5} />}
        </span>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
          {label}
        </span>
      </span>
      {typeof count === "number" && (
        <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{count}</span>
      )}
    </label>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * FilterSidebar
 * ───────────────────────────────────────────────────────────────── */
const FilterSidebar = memo(function FilterSidebar({ filters, onFilterChange, onClearAll, meta }) {
  const toggleArray = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, next);
  };

  const activeCount =
    (filters.brands?.length || 0) +
    (filters.genders?.length || 0) +
    (filters.sports?.length || 0) +
    (filters.conditions?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minPrice !== "" || filters.maxPrice !== "" ? 1 : 0);

  const allSizes = useMemo(() => {
    const set = new Set();
    Object.values(SIZE_SYSTEMS).forEach((arr) => arr.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, []);

  const priceMin = meta?.priceRange?.min ?? 0;
  const priceMax = meta?.priceRange?.max ?? 1000;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-900 dark:text-neutral-100" strokeWidth={2.5} />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Filters</h2>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-semibold text-red-500 hover:text-red-600 outline-none focus:outline-none focus-visible:outline-none"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Gender">
        <ul className="space-y-2">
          {GENDERS.map((g) => {
            const checked = filters.genders?.includes(g);
            const count = meta?.genders?.find((x) => x.value === g)?.count;
            return (
              <li key={g}>
                <CheckboxRow
                  label={g}
                  checked={checked}
                  count={count}
                  onChange={() => toggleArray("genders", g)}
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Sport">
        <ul className="space-y-2">
          {SPORTS.map((s) => {
            const checked = filters.sports?.includes(s);
            const count = meta?.sports?.find((x) => x.value === s)?.count;
            return (
              <li key={s}>
                <CheckboxRow
                  label={s}
                  checked={checked}
                  count={count}
                  onChange={() => toggleArray("sports", s)}
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Min</label>
              <input
                type="number"
                min="0"
                value={filters.minPrice || ""}
                onChange={(e) => onFilterChange("minPrice", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={`$${priceMin}`}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[12px] text-neutral-900 dark:text-neutral-100 tabular-nums outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>
            <span className="text-neutral-300 dark:text-neutral-600 mt-5">—</span>
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Max</label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice || ""}
                onChange={(e) => onFilterChange("maxPrice", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={`$${priceMax}`}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[12px] text-neutral-900 dark:text-neutral-100 tabular-nums outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Under $100", min: 0, max: 100 },
              { label: "$100-$300", min: 100, max: 300 },
              { label: "$300-$500", min: 300, max: 500 },
              { label: "$500+", min: 500, max: 9999 },
            ].map((range) => {
              const active = filters.minPrice === range.min && filters.maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    onFilterChange("minPrice", active ? "" : range.min);
                    onFilterChange("maxPrice", active ? "" : range.max);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    active
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={false}>
        <ul className="space-y-2">
          {BRANDS_FALLBACK.map((b) => {
            const checked = filters.brands?.includes(b);
            const count = meta?.brands?.find((x) => x.value === b)?.count;
            if (meta?.brands && !meta.brands.find((x) => x.value === b)) return null;
            return (
              <li key={b}>
                <CheckboxRow
                  label={b}
                  checked={checked}
                  count={count}
                  onChange={() => toggleArray("brands", b)}
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Condition" defaultOpen={false}>
        <ul className="space-y-2">
          {CONDITIONS.map((c) => {
            const checked = filters.conditions?.includes(c);
            const count = meta?.conditions?.find((x) => x.value === c)?.count;
            return (
              <li key={c}>
                <CheckboxRow
                  label={c}
                  checked={checked}
                  count={count}
                  onChange={() => toggleArray("conditions", c)}
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Size (EU)" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
          {allSizes.map((size) => {
            const active = filters.sizes?.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleArray("sizes", size)}
                className={`min-w-[42px] px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  active
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <CheckboxRow
          label="In stock only"
          checked={filters.inStockOnly || false}
          onChange={(e) => onFilterChange("inStockOnly", e.target.checked)}
        />
      </FilterSection>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Pagination
 * ───────────────────────────────────────────────────────────────── */
const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const p = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      p.push(1);
      if (start > 2) p.push("...");
    }
    for (let i = start; i <= end; i++) p.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) p.push("...");
      p.push(totalPages);
    }
    return p;
  }, [currentPage, totalPages]);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`gap-${i}`} className="px-2 text-neutral-400">…</span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-full text-[12px] font-bold transition-all ${
              page === currentPage
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </nav>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Shop — main
 * ───────────────────────────────────────────────────────────────── */
function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [wishlist, setWishlist] = useState([]);

  const sortRef = useRef(null);
  useClickOutside([sortRef], () => setSortOpen(false), sortOpen);

  const [filters, setFilters] = useState({
    brands: [],
    genders: [],
    sports: [],
    conditions: [],
    sizes: [],
    minPrice: "",
    maxPrice: "",
    inStockOnly: false,
    search: searchParams.get("q") || "",
  });

  const itemsPerPage = 12;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/products/meta/filters");
        if (!cancelled) setMeta(data);
      } catch (err) {
        console.error("Filter meta error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortBy,
        };

        if (filters.search) params.q = filters.search;
        if (filters.brands.length) params.brand = filters.brands.join(",");
        if (filters.genders.length) params.gender = filters.genders.join(",");
        if (filters.sports.length) params.sport = filters.sports.join(",");
        if (filters.conditions.length) params.condition = filters.conditions.join(",");
        if (filters.sizes.length) params.size = filters.sizes.join(",");
        if (filters.minPrice !== "" && filters.minPrice != null) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== "" && filters.maxPrice != null) params.maxPrice = filters.maxPrice;
        if (filters.inStockOnly) params.inStock = "true";

        const { data } = await api.get("/products", { params });

        if (!cancelled) {
          setProducts((data.products || []).map(normalizeProduct));
          setTotalItems(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Products fetch error:", err);
          setError(err?.response?.data?.message || "Failed to load products");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => {
        if (f.search === searchInput) return f;
        return { ...f, search: searchInput };
      });
      setCurrentPage(1);
      if (searchInput) setSearchParams({ q: searchInput });
      else setSearchParams({});
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters({
      brands: [],
      genders: [],
      sports: [],
      conditions: [],
      sizes: [],
      minPrice: "",
      maxPrice: "",
      inStockOnly: false,
      search: "",
    });
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  }, []);

  const handleAddToCart = useCallback((product) => {
    console.log("Add to cart:", product);
  }, []);

  const activeChips = useMemo(() => {
    const chips = [];
    filters.genders?.forEach((g) =>
      chips.push({ key: `g-${g}`, label: g, onRemove: () => handleFilterChange("genders", filters.genders.filter((x) => x !== g)) })
    );
    filters.sports?.forEach((s) =>
      chips.push({ key: `s-${s}`, label: s, onRemove: () => handleFilterChange("sports", filters.sports.filter((x) => x !== s)) })
    );
    filters.brands?.forEach((b) =>
      chips.push({ key: `b-${b}`, label: b, onRemove: () => handleFilterChange("brands", filters.brands.filter((x) => x !== b)) })
    );
    filters.conditions?.forEach((c) =>
      chips.push({ key: `c-${c}`, label: c, onRemove: () => handleFilterChange("conditions", filters.conditions.filter((x) => x !== c)) })
    );
    filters.sizes?.forEach((s) =>
      chips.push({ key: `sz-${s}`, label: `Size ${s}`, onRemove: () => handleFilterChange("sizes", filters.sizes.filter((x) => x !== s)) })
    );
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
      chips.push({
        key: "price",
        label: `$${filters.minPrice || 0} – $${filters.maxPrice || "∞"}`,
        onRemove: () => {
          handleFilterChange("minPrice", "");
          handleFilterChange("maxPrice", "");
        },
      });
    }
    if (filters.inStockOnly) {
      chips.push({ key: "stock", label: "In stock", onRemove: () => handleFilterChange("inStockOnly", false) });
    }
    return chips;
  }, [filters, handleFilterChange]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || "Featured";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" strokeWidth={2} aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                  Explore our collection
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Shop All Products
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
                {loading ? "Loading…" : `${totalItems} ${totalItems === 1 ? "product" : "products"} found`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={2} />
              <span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
                Free shipping over $100
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                meta={meta}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={2} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 rounded-full text-[13px] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-colors outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={2.5} />
                Filters
                {activeChips.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                    {activeChips.length}
                  </span>
                )}
              </button>

              <div ref={sortRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">{activeSortLabel}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <li key={opt.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy(opt.id);
                              setSortOpen(false);
                              setCurrentPage(1);
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-medium transition-colors text-left ${
                              sortBy === opt.id
                                ? "text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800/60"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                            }`}
                          >
                            {opt.label}
                            {sortBy === opt.id && <Check className="h-3.5 w-3.5 text-amber-500" strokeWidth={3} />}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:inline-flex items-center gap-0.5 p-0.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                    view === "grid"
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                    view === "list"
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Active:
                </span>
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      aria-label={`Remove ${chip.label}`}
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-600 px-2 py-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className={`grid gap-4 sm:gap-5 ${
                view === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-neutral-900 border border-red-200/80 dark:border-red-900/60 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
                  <X className="h-7 w-7 text-red-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Failed to load products
                </h3>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-5 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-bold hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <Package className="h-7 w-7 text-neutral-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  No products found
                </h3>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-5 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-bold hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 sm:gap-5 ${
                  view === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}>
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      view={view}
                      index={i}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlist}
                      wishlisted={wishlist.includes(product.id)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-full max-w-sm bg-neutral-50 dark:bg-neutral-950 shadow-2xl z-50 lg:hidden flex flex-col"
              aria-label="Filters"
            >
              <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-neutral-900 dark:text-neutral-100" strokeWidth={2.5} />
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAll}
                  meta={meta}
                />
              </div>

              <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[13px] font-bold hover:opacity-90 transition-opacity"
                >
                  Show {totalItems} {totalItems === 1 ? "product" : "products"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Shop);
