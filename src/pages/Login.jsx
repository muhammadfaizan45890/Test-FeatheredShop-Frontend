import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Check,
  AlertCircle,
  ArrowRight,
  Feather,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getData } from "@/context/userContext";
import Google from "../assets/googleLogo.png";
import API from "@/utils/api";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches navbar / hero / footer (neutral grayscale)
 * ───────────────────────────────────────────────────────────────── */
const palette = {
  bg: "#FFFFFF",
  bgAlt: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceSoft: "#F5F5F5",
  ink: "#171717",
  inkSoft: "#525252",
  inkMuted: "#A3A3A3",
  border: "#E5E5E5",        // kept for divider rule only
  accent: "#171717",
  accentDeep: "#0A0A0A",
  gold: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

const BRAND_NAME = "FeatheredSHOP";
const REMEMBER_KEY = "featheredshop:remembered-email";

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .login-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .login-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 48;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .login-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .login-hd-num { font-variant-numeric: tabular-nums; }
`;

/* ─────────────────────────────────────────────────────────────────
 * VALIDATION UTILITIES
 * ───────────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return "Email is required";
  if (!EMAIL_RE.test(v)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  return null;
};

const getPasswordStrength = (value) => {
  if (!value) return { level: 0, label: "", color: palette.border };
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 2) return { level: 1, label: "Weak", color: palette.danger };
  if (score === 3) return { level: 2, label: "Fair", color: palette.warning };
  if (score === 4) return { level: 3, label: "Good", color: palette.gold };
  return { level: 4, label: "Strong", color: palette.success };
};

/* ─────────────────────────────────────────────────────────────────
 * MOTION VARIANTS
 * ───────────────────────────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ─────────────────────────────────────────────────────────────────
 * TextField — borderless, filled inputs
 * ───────────────────────────────────────────────────────────────── */
const TextField = memo(function TextField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  touched,
  autoComplete,
  autoFocus,
  disabled,
  rightSlot,
  labelAction,
}) {
  const showError = touched && error;
  const showSuccess = touched && !error && value.length > 0;

  const fillFor = () => {
    if (showError) return "rgba(239, 68, 68, 0.06)";
    if (showSuccess) return "rgba(16, 185, 129, 0.06)";
    return palette.surfaceSoft;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="login-hd-sans text-[13px] font-semibold tracking-[-0.005em]"
          style={{ color: palette.ink }}
        >
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-[17px] w-[17px] pointer-events-none transition-colors"
            style={{
              color: showError
                ? palette.danger
                : showSuccess
                ? palette.success
                : palette.inkMuted,
            }}
            strokeWidth={1.9}
          />
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={!!showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className="
            login-hd-sans
            w-full h-12
            pl-11 pr-12
            rounded-full
            text-[14px]
            tracking-[-0.005em]
            transition-[background-color,box-shadow]
            duration-200
            outline-none focus:outline-none focus-visible:outline-none
            disabled:opacity-60 disabled:cursor-not-allowed
          "
          style={{
            background: fillFor(),
            color: palette.ink,
            border: "none",
            boxShadow: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = palette.surface;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${
              showError
                ? `${palette.danger}20`
                : showSuccess
                ? `${palette.success}20`
                : `${palette.accent}10`
            }`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = fillFor();
            e.currentTarget.style.boxShadow = "none";
            onBlur?.(e);
          }}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showSuccess && !rightSlot && (
            <span
              className="inline-flex items-center justify-center h-7 w-7 rounded-full"
              style={{ background: `${palette.success}15`, color: palette.success }}
              aria-hidden="true"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          )}
          {rightSlot}
        </div>
      </div>

      <AnimatePresence>
        {showError && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="login-hd-sans flex items-center gap-1.5 text-[12px] font-medium overflow-hidden"
            style={{ color: palette.danger }}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * PasswordField
 * ───────────────────────────────────────────────────────────────── */
const PasswordField = memo(function PasswordField({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
}) {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => getPasswordStrength(value), [value]);
  const showStrength = value.length > 0 && !error;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="login-hd-sans text-[13px] font-semibold tracking-[-0.005em]"
          style={{ color: palette.ink }}
        >
          Password
        </label>
        <Link
          to="/forgot-password"
          className="
            login-hd-sans text-[12px] font-semibold
            hover:underline transition-opacity hover:opacity-80
            outline-none focus:outline-none focus-visible:outline-none
          "
          style={{ color: palette.accent }}
        >
          Forgot password?
        </Link>
      </div>

      <TextField
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Enter your password"
        icon={Lock}
        error={error}
        touched={touched}
        autoComplete="current-password"
        disabled={disabled}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-label={visible ? "Hide password" : "Show password"}
            className="
              inline-flex items-center justify-center
              h-8 w-8 rounded-full
              transition-colors hover:bg-neutral-200/60
              outline-none focus:outline-none focus-visible:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ color: palette.inkSoft }}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.9} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.9} />
            )}
          </button>
        }
      />

      <AnimatePresence>
        {showStrength && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 flex items-center gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        n <= strength.level ? strength.color : palette.border,
                    }}
                  />
                ))}
              </div>
              <span
                className="login-hd-sans text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * RememberCheckbox — borderless, filled square
 * ───────────────────────────────────────────────────────────────── */
const RememberCheckbox = memo(function RememberCheckbox({
  checked,
  onChange,
  disabled,
}) {
  return (
    <label
      className={`
        login-hd-sans inline-flex items-center gap-2.5 select-none
        text-[13px] font-medium
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
      `}
      style={{ color: palette.inkSoft }}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span
          className="
            h-[18px] w-[18px] rounded-[6px]
            flex items-center justify-center
            transition-colors duration-200
          "
          style={{
            border: "none",
            background: checked ? palette.accent : palette.surfaceSoft,
          }}
        >
          <Check
            className="h-3 w-3 text-white transition-opacity duration-150"
            style={{ opacity: checked ? 1 : 0 }}
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
      </span>
      Remember me
    </label>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * GoogleButton — borderless, filled
 * ───────────────────────────────────────────────────────────────── */
const GoogleButton = memo(function GoogleButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        login-hd-sans
        group relative w-full h-12
        inline-flex items-center justify-center gap-3
        rounded-full
        text-[13.5px] font-semibold tracking-[-0.005em]
        transition-[background-color,transform]
        duration-200
        active:scale-[0.99]
        disabled:opacity-60 disabled:cursor-not-allowed
        outline-none focus:outline-none focus-visible:outline-none
      "
      style={{
        border: "none",
        background: palette.surfaceSoft,
        color: palette.ink,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = "#EBEBEB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = palette.surfaceSoft;
      }}
    >
      <img
        src={Google}
        alt=""
        aria-hidden="true"
        className="h-[18px] w-[18px] object-contain"
        loading="lazy"
      />
      Continue with Google
    </button>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * SuccessOverlay
 * ───────────────────────────────────────────────────────────────── */
const SuccessOverlay = memo(function SuccessOverlay({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(23, 23, 23, 0.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            style={{ background: palette.surface }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 18 }}
              className="inline-flex items-center justify-center h-16 w-16 rounded-full"
              style={{ background: `${palette.success}15`, color: palette.success }}
            >
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </motion.span>
            <div className="text-center">
              <p
                className="login-hd-serif text-xl font-medium"
                style={{ color: palette.ink }}
              >
                Welcome back
              </p>
              <p
                className="login-hd-sans text-[13px] mt-1"
                style={{ color: palette.inkSoft }}
              >
                Redirecting you to the shop…
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Login — main
 * ───────────────────────────────────────────────────────────────── */
function Login() {
  const { setUser } = getData();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setFormData((prev) => ({ ...prev, email: saved }));
        setRemember(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const errors = useMemo(
    () => ({
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    }),
    [formData]
  );

  const isValid = !errors.email && !errors.password;

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      if (!isValid || isLoading) return;

      setIsLoading(true);
      try {
        const res = await axios.post(
          `${API}/user/login`,
          { email: formData.email.trim(), password: formData.password },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        if (res.data?.success) {
          try {
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("loginTime", Date.now().toString());
            if (remember) {
              localStorage.setItem(REMEMBER_KEY, formData.email.trim());
            } else {
              localStorage.removeItem(REMEMBER_KEY);
            }
          } catch {
            /* noop */
          }

          setUser(res.data.user);
          setSuccess(true);
          toast.success(res.data.message || "Login successful");

          setTimeout(() => navigate(redirectTo, { replace: true }), 900);
        } else {
          throw new Error(res.data?.message || "Login failed");
        }
      } catch (error) {
        const status = error?.response?.status;
        let message = error?.response?.data?.message;

        if (!message) {
          if (status === 401) message = "Incorrect email or password.";
          else if (status === 429) message = "Too many attempts. Please try again shortly.";
          else if (status >= 500) message = "Server error. Please try again.";
          else if (error?.code === "ERR_NETWORK")
            message = "Network error. Check your connection.";
          else message = "Login failed. Please try again.";
        }

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isValid, isLoading, remember, redirectTo, navigate, setUser]
  );

  const handleGoogleLogin = useCallback(() => {
    window.open(`${API}/auth/google`, "_self");
  }, []);

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="login-hd-root relative w-full min-h-screen flex items-center justify-center"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <style>{HD_CSS}</style>

      {/* Ambient background blobs — very subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full filter blur-3xl opacity-[0.06]"
          style={{ background: palette.accent }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full filter blur-3xl opacity-[0.05]"
          style={{ background: palette.gold }}
        />
      </div>

      {/* Centered form shell */}
      <div className="relative w-full max-w-md mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <motion.section
          variants={formVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="login-heading"
          className="relative"
        >
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <Feather
              className="h-6 w-6"
              style={{ color: palette.ink }}
              strokeWidth={2}
            />
            <span
              className="login-hd-serif text-2xl font-medium tracking-tighter"
              style={{ color: palette.ink }}
            >
              {BRAND_NAME}
              <span style={{ color: palette.gold }}>.</span>
            </span>
          </div>

          {/* Heading */}
          <motion.header
            variants={fieldVariants}
            className="space-y-2 mb-8 text-center"
          >
            <h1
              id="login-heading"
              className="
                login-hd-serif
                text-[clamp(1.75rem,4vw,2.25rem)]
                font-medium tracking-[-0.025em] leading-[1.08]
              "
              style={{ color: palette.ink }}
            >
              Welcome back.
            </h1>
            <p
              className="login-hd-sans text-[13.5px] leading-relaxed max-w-xs mx-auto"
              style={{ color: palette.inkSoft }}
            >
              Sign in to access your orders, wishlist, and personalized
              recommendations.
            </p>
          </motion.header>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            aria-busy={isLoading}
          >
            <motion.div variants={fieldVariants}>
              <TextField
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email}
                touched={touched.email}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={fieldVariants}>
              <PasswordField
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={errors.password}
                touched={touched.password}
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              variants={fieldVariants}
              className="flex items-center justify-between gap-3 pt-1"
            >
              <RememberCheckbox
                checked={remember}
                onChange={setRemember}
                disabled={isLoading}
              />
              <Link
                to="/signup"
                className="
                  login-hd-sans hidden sm:inline-block
                  text-[12.5px] font-medium
                  hover:underline transition-opacity hover:opacity-80
                  outline-none focus:outline-none focus-visible:outline-none
                "
                style={{ color: palette.inkSoft }}
              >
                Need an account?
              </Link>
            </motion.div>

            <motion.div variants={fieldVariants} className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={
                  isLoading || (!isValid && (touched.email || touched.password))
                }
                className="
                  login-hd-sans
                  group relative w-full h-12
                  inline-flex items-center justify-center gap-2
                  rounded-full
                  text-[13.5px] font-semibold tracking-[-0.005em]
                  text-white
                  transition-[background-color,transform,box-shadow]
                  duration-200
                  active:scale-[0.99]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  outline-none focus:outline-none focus-visible:outline-none
                  overflow-hidden
                "
                style={{
                  background: palette.accent,
                  boxShadow: `0 8px 20px -10px ${palette.accent}80, 0 2px 6px -2px rgba(0,0,0,0.15)`,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.background = palette.accentDeep;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.accent;
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-1">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div
                    className="w-full border-t"
                    style={{ borderColor: palette.border }}
                  />
                </div>
                <div className="relative flex justify-center">
                  <span
                    className="login-hd-sans px-3 text-[10.5px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      background: palette.bg,
                      color: palette.inkMuted,
                    }}
                  >
                    or
                  </span>
                </div>
              </div>

              <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />
            </motion.div>
          </form>

          {/* Footer link */}
          <motion.p
            variants={fieldVariants}
            className="login-hd-sans mt-8 text-center text-[13px] sm:text-[13.5px]"
            style={{ color: palette.inkSoft }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="
                font-semibold hover:underline
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.accent }}
            >
              Create one
            </Link>
          </motion.p>

          {/* Trust line */}
          <motion.div
            variants={fieldVariants}
            className="mt-6 flex items-center justify-center gap-2 text-[11px]"
            style={{ color: palette.inkMuted }}
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            <span className="login-hd-sans">
              Protected by 256-bit SSL encryption
            </span>
          </motion.div>
        </motion.section>

        {/* Legal footer */}
        <p
          className="login-hd-sans mt-10 text-center text-[11px] tracking-[0.02em]"
          style={{ color: palette.inkMuted }}
        >
          By signing in you agree to our{" "}
          <Link to="/terms" className="underline hover:no-underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:no-underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <SuccessOverlay show={success} />
    </motion.main>
  );
}

export default memo(Login);