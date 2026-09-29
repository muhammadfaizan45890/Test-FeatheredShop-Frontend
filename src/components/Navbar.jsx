/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  ChevronDown,
  X,
  User,
  Feather,
  ShoppingBag,
  Heart,
  LogOut,
  Settings,
  Package,
  MapPin,
  Minus,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  Command,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "./hooks/useAuth";
import useCart from "./hooks/useCart";
import useClickOutside from "./hooks/useClickOutside";
import useFocusTrap from "./hooks/useFocusTrap";

/* ─────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────── */
const BRAND_NAME = "FeatheredSHOP";
const BRAND_TAGLINE = "Kicks & Culture";

const CATEGORIES = [
  { name: "Sneakers", link: "/shop?category=Sneakers", featured: "Air Max, Retro, Court" },
  { name: "Running", link: "/shop?category=Running", featured: "Performance & Training" },
  { name: "Basketball", link: "/shop?category=Basketball", featured: "Court Kings" },
  { name: "Boots", link: "/shop?category=Boots", featured: "Timberland, Dr. Martens" },
  { name: "Casual", link: "/shop?category=Casual", featured: "Everyday Comfort" },
  { name: "Limited Edition", link: "/shop?category=Limited", featured: "Rare & Deadstock" },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, label: "Facebook", href: "#" },
  { icon: FaXTwitter, label: "Twitter", href: "https://x.com/feathered_pen" },
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaYoutube, label: "YouTube", href: "#" },
];

const NAV_ITEMS = [
  { label: "Home", link: "/" },
  { label: "New Drops", link: "/new-arrivals", badge: "NEW" },
  { label: "Sale", link: "/sale", isSale: true },
  {
    label: "Shop",
    sub: CATEGORIES.map((c) => ({
      label: c.name,
      link: c.link,
      featured: c.featured,
    })),
  },
  { label: "Brands", link: "/brands" },
  { label: "Releases", link: "/releases" },
];

/* ─────────────────────────────────────────────────────────────────
 * UTILITIES
 * ───────────────────────────────────────────────────────────────── */
const getAvatarUrl = (avatarPath, apiBase) => {
  try {
    if (!avatarPath) return null;
    if (/^https?:\/\//.test(avatarPath)) return avatarPath;
    if (!apiBase) return null;
    return `${apiBase.replace(/\/+$/, "")}/${avatarPath.replace(/^\/+/, "")}`;
  } catch {
    return null;
  }
};

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

/* ─────────────────────────────────────────────────────────────────
 * BrandLogo — Feather icon (original brand mark)
 * ───────────────────────────────────────────────────────────────── */
const BrandLogo = memo(function BrandLogo({
  size = "md",
  showTagline = true,
  onClick,
  className = "",
}) {
  const sizes = {
    sm: { icon: "h-4 w-4", text: "text-base", tag: "text-[7px] tracking-[0.2em]" },
    md: {
      icon: "h-5 w-5 sm:h-6 sm:w-6",
      text: "text-lg sm:text-xl md:text-2xl",
      tag: "text-[8px] sm:text-[9px] tracking-[0.25em]",
    },
    lg: { icon: "h-5 w-5", text: "text-lg", tag: "text-[8px] tracking-[0.2em]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${BRAND_NAME} Home`}
      className={`flex flex-col items-center group shrink-0 rounded-lg px-1 sm:px-2 outline-none focus:outline-none focus-visible:outline-none ${className}`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Feather
          className={`${s.icon} text-neutral-900 dark:text-neutral-100 transition-transform duration-300 group-hover:-rotate-12`}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span
          className={`${s.text} font-black tracking-tighter text-neutral-900 dark:text-neutral-100 leading-none`}
        >
          {BRAND_NAME}
          <span className="text-amber-500">.</span>
        </span>
      </div>
      {showTagline && (
        <span
          className={`${s.tag} font-light uppercase text-neutral-400 mt-0.5 whitespace-nowrap`}
        >
          {BRAND_TAGLINE}
        </span>
      )}
    </Link>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * SocialIcons
 * ───────────────────────────────────────────────────────────────── */
const SocialIcons = memo(function SocialIcons({ size = 16, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none"
        >
          <Icon size={size} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * LiveClock
 * ───────────────────────────────────────────────────────────────── */
const LiveClock = memo(function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fullDate = useMemo(
    () =>
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [now]
  );

  const shortDate = useMemo(
    () => now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    [now]
  );

  const timeString = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [now]
  );

  const shortTime = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    [now]
  );

  return (
    <div className="bg-neutral-950 text-neutral-300 border-b border-neutral-800/80 text-[11px] font-medium tracking-wide">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="hidden md:inline truncate">{fullDate}</span>
          <span className="md:hidden truncate">{shortDate}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-neutral-400">
            <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
            Free shipping on orders over $100
          </span>
          <span className="hidden sm:inline tabular-nums font-mono text-neutral-400">
            {timeString}
          </span>
          <span className="sm:hidden tabular-nums font-mono text-neutral-400">
            {shortTime}
          </span>
        </div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * SearchBox — clean, no dropdown
 * ───────────────────────────────────────────────────────────────── */
const SearchBox = memo(function SearchBox({
  variant = "default",
  onNavigate,
  onClose,
  autoFocus = false,
  showShortcutHint = false,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const submit = useCallback(
    (value) => {
      const trimmed = (value ?? "").trim();
      if (!trimmed) return;
      onNavigate?.(trimmed);
      setQuery("");
      onClose?.();
    },
    [onNavigate, onClose]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      submit(query);
    },
    [query, submit]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        if (query) {
          setQuery("");
        } else {
          onClose?.();
        }
      }
    },
    [query, onClose]
  );

  const clear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      <label htmlFor={`${variant}-search-input`} className="sr-only">
        Search sneakers, brands, or collections
      </label>

      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-[18px] w-[18px] pointer-events-none"
        strokeWidth={2}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        id={`${variant}-search-input`}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search sneakers, brands…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        enterKeyHint="search"
        className="w-full pl-10 pr-20 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:border-neutral-300 dark:focus:border-neutral-600 rounded-full text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-colors outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
      />

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : showShortcutHint ? (
          <kbd className="hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono text-neutral-400 pointer-events-none">
            <Command className="h-2.5 w-2.5" aria-hidden="true" />K
          </kbd>
        ) : null}
      </div>
    </form>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * DesktopNav
 * ───────────────────────────────────────────────────────────────── */
const DesktopNav = memo(function DesktopNav({ navItems, currentPath }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);
  const closeTimeout = useRef(null);

  useClickOutside(
    [containerRef],
    () => setOpenDropdown(null),
    Boolean(openDropdown)
  );

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const handleMouseEnter = useCallback((label, hasSub) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    if (hasSub) setOpenDropdown(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpenDropdown(null), 180);
  }, []);

  const isActive = useCallback(
    (link) => {
      if (!link) return false;
      if (link === "/") return currentPath === "/";
      return currentPath === link || currentPath.startsWith(`${link}/`);
    },
    [currentPath]
  );

  return (
    <nav
      className="hidden lg:block border-t border-neutral-100 dark:border-neutral-800/60"
      aria-label="Primary navigation"
    >
      <ul
        ref={containerRef}
        className="flex items-center justify-center gap-1 xl:gap-2 py-2.5 text-[11px] xl:text-xs font-semibold tracking-wider uppercase"
      >
        {navItems.map((item) => {
          const subItems = item.sub || [];
          const hasSub = subItems.length > 0;
          const isOpen = openDropdown === item.label;
          const active = isActive(item.link);
          const dropdownId = `desktop-dropdown-${item.label
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

          return (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.label, hasSub)}
              onMouseLeave={handleMouseLeave}
            >
              {hasSub ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                    className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors outline-none focus:outline-none focus-visible:outline-none ${
                      isOpen
                        ? "text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={dropdownId}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={dropdownId}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-neutral-200/80 dark:border-neutral-800 py-2 z-50 overflow-hidden"
                      >
                        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {subItems.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                to={sub.link}
                                onClick={() => setOpenDropdown(null)}
                                className="group flex flex-col px-4 py-3 text-xs normal-case hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                              >
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                  {sub.label}
                                </span>
                                {sub.featured && (
                                  <span className="text-[10px] text-neutral-400 group-hover:text-neutral-500 mt-0.5">
                                    {sub.featured}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.link}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors outline-none focus:outline-none focus-visible:outline-none ${
                    item.isSale
                      ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      : active
                      ? "text-neutral-900 dark:text-white font-bold"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-amber-950 tracking-normal">
                      {item.badge}
                    </span>
                  )}
                  {active && !item.isSale && (
                    <motion.span
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-neutral-900 dark:bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * AccountMenu
 * ───────────────────────────────────────────────────────────────── */
const AccountMenu = memo(function AccountMenu({
  user,
  userRole,
  apiBase,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useClickOutside([rootRef], () => setOpen(false), open);

  const initials = useMemo(() => {
    if (user?.fullname) {
      return user.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email ? user.email[0].toUpperCase() : "U";
  }, [user]);

  const menuLinks = useMemo(
    () => [
      { icon: Package, label: "My Orders", to: "/orders" },
      { icon: Heart, label: "Wishlist", to: "/wishlist" },
      { icon: MapPin, label: "Addresses", to: "/addresses" },
      { icon: Settings, label: "Settings", to: "/account" },
    ],
    []
  );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors outline-none focus:outline-none focus-visible:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User account menu"
      >
        <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700">
          <AvatarImage
            src={getAvatarUrl(user?.avatar, apiBase)}
            loading="lazy"
            alt=""
          />
          <AvatarFallback className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-neutral-100 dark:divide-neutral-800"
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-700 shrink-0">
                <AvatarImage
                  src={getAvatarUrl(user?.avatar, apiBase)}
                  loading="lazy"
                  alt=""
                />
                <AvatarFallback className="bg-neutral-900 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.fullname || "Account"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="py-1.5">
              {menuLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  <item.icon
                    className="h-4 w-4 text-neutral-400 shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              ))}
              {userRole === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  <Shield
                    className="h-4 w-4 shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="py-1.5">
              <button
                type="button"
                onClick={() => {
                  onLogout?.();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left outline-none focus:outline-none focus-visible:outline-none"
              >
                <LogOut
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * MobileDrawer
 * ───────────────────────────────────────────────────────────────── */
const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  user,
  userRole,
  profileRoute,
  onLogout,
}) {
  const drawerRef = useRef(null);
  const [openGroup, setOpenGroup] = useState(null);
  useFocusTrap(drawerRef, isOpen);

  useEffect(() => {
    if (!isOpen) setOpenGroup(null);
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            aria-hidden="true"
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl z-50 lg:hidden flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <BrandLogo size="sm" showTagline={false} onClick={onClose} />
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const subItems = item.sub || [];
                  const hasSub = subItems.length > 0;
                  const isExpanded = openGroup === item.label;

                  if (hasSub) {
                    return (
                      <li
                        key={item.label}
                        className="border-b border-neutral-100 dark:border-neutral-800/60"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenGroup(isExpanded ? null : item.label)
                          }
                          className="flex items-center justify-between w-full py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 rounded-md px-1 outline-none focus:outline-none focus-visible:outline-none"
                          aria-expanded={isExpanded}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="pb-2 pl-3 space-y-0.5">
                                {subItems.map((sub) => (
                                  <li key={sub.label}>
                                    <Link
                                      to={sub.link}
                                      onClick={onClose}
                                      className="block py-2 px-2 text-xs rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={item.label}
                      className="border-b border-neutral-100 dark:border-neutral-800/60"
                    >
                      <Link
                        to={item.link}
                        onClick={onClose}
                        className={`flex items-center justify-between py-3 px-1 text-sm font-semibold transition-colors outline-none focus:outline-none focus-visible:outline-none ${
                          item.isSale
                            ? "text-red-500 hover:text-red-600"
                            : "text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-amber-950">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 space-y-4 shrink-0">
              <SocialIcons className="justify-center" size={18} />
              {user ? (
                <div className="space-y-2">
                  <Link
                    to={profileRoute || "/account"}
                    onClick={onClose}
                    className="block w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  >
                    Manage Profile
                  </Link>
                  {userRole === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={onClose}
                      className="block w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onLogout?.();
                      onClose();
                    }}
                    className="block w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="block w-full py-3 text-center text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * CartDrawer
 * ───────────────────────────────────────────────────────────────── */
const CartDrawer = memo(function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  subtotal = 0,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  const drawerRef = useRef(null);
  useFocusTrap(drawerRef, isOpen);

  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + (i.qty || 0), 0),
    [cart]
  );

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Your Kicks"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
                  strokeWidth={2}
                />
                <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                  Your Kicks{" "}
                  <span className="text-neutral-400 font-mono">
                    ({cartCount})
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <ShoppingBag
                      className="h-7 w-7 text-neutral-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Your cart is empty
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Add a fresh pair to get started
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="inline-block px-6 py-2.5 text-xs font-semibold rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                  >
                    Shop Sneakers
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {cart.map((item) => (
                    <li key={item.id} className="pt-4 first:pt-0 flex gap-4">
                      <Link
                        to={`/product/${item.id}`}
                        onClick={onClose}
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-800 outline-none focus:outline-none focus-visible:outline-none"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400">
                            N/A
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {item.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() => onRemove?.(item.id)}
                              className="text-neutral-400 hover:text-red-500 transition-colors shrink-0 p-0.5 rounded outline-none focus:outline-none focus-visible:outline-none"
                              aria-label={`Remove ${item.name}`}
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                              {item.variant}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="inline-flex items-center border border-neutral-200 dark:border-neutral-700 rounded-full">
                            <button
                              type="button"
                              onClick={() => onDecrement?.(item.id)}
                              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-full transition-colors outline-none focus:outline-none focus-visible:outline-none"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" strokeWidth={2} />
                            </button>
                            <span className="px-2 font-mono text-xs min-w-[24px] text-center">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onIncrement?.(item.id)}
                              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-r-full transition-colors outline-none focus:outline-none focus-visible:outline-none"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" strokeWidth={2} />
                            </button>
                          </div>
                          <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                            {formatPrice((item.price || 0) * (item.qty || 0))}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 space-y-4 shrink-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-mono font-bold text-base text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 text-center">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-full font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                >
                  Checkout Now
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Navbar (Main)
 * ───────────────────────────────────────────────────────────────── */
function Navbar({ apiBase = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userRole, profileRoute, logout } = useAuth();
  const { cart = [], subtotal = 0, incrementItem, decrementItem, removeItem } =
    useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.qty || 0), 0),
    [cart]
  );

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearchNavigate = useCallback(
    (queryText) => {
      navigate(`/shop?q=${encodeURIComponent(queryText)}`);
    },
    [navigate]
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      <LiveClock />

      <div
        className={`w-full bg-white/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b transition-all duration-300 ${
          isScrolled
            ? "shadow-lg border-neutral-200/80 dark:border-neutral-800/80"
            : "border-neutral-200/50 dark:border-neutral-800/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Left Cluster */}
            <div className="flex items-center gap-1 sm:gap-2 lg:w-1/4 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 rounded-full lg:hidden text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 outline-none focus:outline-none focus-visible:outline-none"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-full xl:hidden text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 outline-none focus:outline-none focus-visible:outline-none"
                aria-label="Toggle search"
                aria-expanded={searchOpen}
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>

              <div className="hidden xl:block w-full max-w-xs">
                <SearchBox
                  variant="desktop-inline"
                  onNavigate={handleSearchNavigate}
                  showShortcutHint
                />
              </div>
            </div>

            {/* Centered Logo */}
            <BrandLogo size="md" />

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 lg:w-1/4 shrink-0">
              <SocialIcons
                className="hidden xl:flex border-r border-neutral-200 dark:border-neutral-800 pr-2 mr-1"
                size={15}
              />

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <AccountMenu
                  user={user}
                  userRole={userRole}
                  apiBase={apiBase}
                  onLogout={logout}
                />
              ) : (
                <Link
                  to="/login"
                  className="p-2 sm:p-2.5 rounded-full text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden overflow-hidden border-t border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
                <SearchBox
                  variant="mobile-expandable"
                  autoFocus
                  onNavigate={handleSearchNavigate}
                  onClose={() => setSearchOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DesktopNav navItems={NAV_ITEMS} currentPath={location.pathname} />
      </div>

      {/* Drawers */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
        user={user}
        userRole={userRole}
        profileRoute={profileRoute}
        onLogout={logout}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        subtotal={subtotal}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onRemove={removeItem}
      />
    </header>
  );
}

export default memo(Navbar);