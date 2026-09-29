import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Check,
  AlertCircle,
  ArrowRight,
  Feather,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Google from "../assets/googleLogo.png";
import API from "@/utils/api";

/* ─────────────────────────────────────────────────────────────────
 * PALETTE — matches navbar / hero / footer / login
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
 * BRAND
 * ───────────────────────────────────────────────────────────────── */
const BRAND_NAME = "FeatheredSHOP";

/* ─────────────────────────────────────────────────────────────────
 * HD TEXT CSS
 * ───────────────────────────────────────────────────────────────── */
const HD_CSS = `
  .signup-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .signup-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 48;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
  }
  .signup-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .signup-hd-num { font-variant-numeric: tabular-nums; }
`;

/* ─────────────────────────────────────────────────────────────────
 * VALIDATION UTILITIES
 * ───────────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SPECIAL_RE = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/;

const validateName = (value) => {
  const v = value.trim();
  if (!v) return "Full name is required";
  if (v.length < 2) return "Name must be at least 2 characters";
  return null;
};

const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return "Email is required";
  if (!EMAIL_RE.test(v)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[0-9]/.test(value)
  ) {
    return "Password must include uppercase, lowercase, and a number";
  }
  return null;
};

const getPasswordRequirements = (value) => ({
  hasMinLength: value.length >= 8,
  hasUppercase: /[A-Z]/.test(value),
  hasLowercase: /[a-z]/.test(value),
  hasNumber: /[0-9]/.test(value),
  hasSpecialChar: SPECIAL_RE.test(value),
});

const getPasswordStrength = (value) => {
  if (!value) return { level: 0, label: "", color: palette.border };
  const req = getPasswordRequirements(value);
  const score = Object.values(req).filter(Boolean).length;

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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ─────────────────────────────────────────────────────────────────
 * TextField — borderless, filled
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
  disabled,
  rightSlot,
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
      <label
        htmlFor={id}
        className="signup-hd-sans block text-[13px] font-semibold tracking-[-0.005em]"
        style={{ color: palette.ink }}
      >
        {label}
      </label>

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
          disabled={disabled}
          aria-invalid={!!showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className="
            signup-hd-sans
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
            className="signup-hd-sans flex items-center gap-1.5 text-[12px] font-medium overflow-hidden"
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
 * PasswordRequirement — single checklist item
 * ───────────────────────────────────────────────────────────────── */
const PasswordRequirement = memo(function PasswordRequirement({ met, label }) {
  return (
    <li className="flex items-center gap-1.5 text-[11.5px]">
      <motion.span
        initial={false}
        animate={{
          backgroundColor: met ? palette.success : "transparent",
        }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full shrink-0"
        style={{
          border: `1px solid ${met ? palette.success : palette.inkMuted}`,
        }}
        aria-hidden="true"
      >
        <Check
          className="h-2 w-2 text-white transition-opacity duration-150"
          style={{ opacity: met ? 1 : 0 }}
          strokeWidth={3.5}
        />
      </motion.span>
      <span
        className="signup-hd-sans transition-colors"
        style={{ color: met ? palette.ink : palette.inkMuted }}
      >
        {label}
      </span>
    </li>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * PasswordField — with toggle + live strength + requirements
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
  const requirements = useMemo(() => getPasswordRequirements(value), [value]);
  const showStrength = value.length > 0 && !error;

  const requirementList = useMemo(
    () => [
      { key: "hasMinLength", label: "At least 8 characters" },
      { key: "hasUppercase", label: "One uppercase letter" },
      { key: "hasLowercase", label: "One lowercase letter" },
      { key: "hasNumber", label: "One number" },
      { key: "hasSpecialChar", label: "One special character" },
    ],
    []
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="signup-hd-sans block text-[13px] font-semibold tracking-[-0.005em]"
        style={{ color: palette.ink }}
      >
        Password
      </label>

      <TextField
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Create a strong password"
        icon={Lock}
        error={error}
        touched={touched}
        autoComplete="new-password"
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

      {/* Strength bar + label */}
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
                className="signup-hd-sans text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>

            {/* Requirements checklist */}
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3">
              {requirementList.map((req) => (
                <PasswordRequirement
                  key={req.key}
                  met={requirements[req.key]}
                  label={req.label}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * ConfirmPasswordField — with match indicator
 * ───────────────────────────────────────────────────────────────── */
const ConfirmPasswordField = memo(function ConfirmPasswordField({
  id,
  name,
  value,
  password,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
}) {
  const [visible, setVisible] = useState(false);
  const matches = value.length > 0 && value === password;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="signup-hd-sans text-[13px] font-semibold tracking-[-0.005em]"
          style={{ color: palette.ink }}
        >
          Confirm password
        </label>
        <AnimatePresence>
          {value.length > 0 && (
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.18 }}
              className="signup-hd-sans inline-flex items-center gap-1 text-[11.5px] font-semibold"
              style={{
                color: matches ? palette.success : palette.danger,
              }}
            >
              {matches ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2.75} />
                  Match
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" strokeWidth={2.25} />
                  No match
                </>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <TextField
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Re-enter your password"
        icon={Shield}
        error={error}
        touched={touched}
        autoComplete="new-password"
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
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * GoogleButton — mirrors login
 * ───────────────────────────────────────────────────────────────── */
const GoogleButton = memo(function GoogleButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        signup-hd-sans
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
 * TermsCheckbox — required consent
 * ───────────────────────────────────────────────────────────────── */
const TermsCheckbox = memo(function TermsCheckbox({
  checked,
  onChange,
  disabled,
}) {
  return (
    <label
      className={`
        signup-hd-sans flex items-start gap-2.5 select-none
        text-[12.5px] leading-relaxed
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
      `}
      style={{ color: palette.inkSoft }}
    >
      <span className="relative inline-flex items-center justify-center mt-[3px] shrink-0">
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
      <span>
        I agree to the{" "}
        <Link
          to="/terms"
          className="underline underline-offset-2 hover:no-underline"
          style={{ color: palette.ink, fontWeight: 600 }}
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:no-underline"
          style={{ color: palette.ink, fontWeight: 600 }}
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
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
                className="signup-hd-serif text-xl font-medium"
                style={{ color: palette.ink }}
              >
                Account created
              </p>
              <p
                className="signup-hd-sans text-[13px] mt-1"
                style={{ color: palette.inkSoft }}
              >
                Redirecting you to verify…
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/* ─────────────────────────────────────────────────────────────────
 * Signup — main
 * ───────────────────────────────────────────────────────────────── */
function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const errors = useMemo(
    () => ({
      username: validateName(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword:
        !formData.confirmPassword
          ? "Please confirm your password"
          : formData.password !== formData.confirmPassword
          ? "Passwords do not match"
          : null,
    }),
    [formData]
  );

  const isValid =
    !errors.username &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "confirmPassword" && errors.confirmPassword) {
        setTouched((prev) => ({ ...prev, confirmPassword: true }));
      }
    },
    [errors.confirmPassword]
  );

  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleTermsChange = useCallback((checked) => {
    setAgreeTerms(checked);
    if (checked) setTermsError(false);
  }, []);

  const handleGoogleSignup = useCallback(() => {
    window.open(`${API}/auth/google`, "_self");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      });

      if (!agreeTerms) {
        setTermsError(true);
        toast.error("Please accept the Terms to continue.");
        return;
      }
      if (!isValid || isLoading) return;

      setIsLoading(true);
      try {
        const res = await axios.post(
          `${API}/user/register`,
          {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
          },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        if (res.data?.success) {
          setSuccess(true);
          toast.success(res.data.message || "Account created successfully!");
          setTimeout(() => navigate("/verify"), 900);
        } else {
          throw new Error(res.data?.message || "Registration failed");
        }
      } catch (error) {
        const status = error?.response?.status;
        let message = error?.response?.data?.message;

        if (!message) {
          if (status === 409) message = "An account with this email already exists.";
          else if (status === 400) message = "Please check your details and try again.";
          else if (status === 429) message = "Too many attempts. Try again shortly.";
          else if (status >= 500) message = "Server error. Please try again.";
          else if (error?.code === "ERR_NETWORK")
            message = "Network error. Check your connection.";
          else message = "Registration failed. Please try again.";
        }

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isValid, isLoading, agreeTerms, navigate]
  );

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="signup-hd-root relative w-full min-h-screen flex items-center justify-center"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <style>{HD_CSS}</style>

      {/* Ambient blobs */}
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

      {/* Centered shell */}
      <div className="relative w-full max-w-md mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <motion.section
          variants={formVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="signup-heading"
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
              className="signup-hd-serif text-2xl font-medium tracking-tighter"
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
              id="signup-heading"
              className="
                signup-hd-serif
                text-[clamp(1.75rem,4vw,2.25rem)]
                font-medium tracking-[-0.025em] leading-[1.08]
              "
              style={{ color: palette.ink }}
            >
              Create your account.
            </h1>
            <p
              className="signup-hd-sans text-[13.5px] leading-relaxed max-w-xs mx-auto"
              style={{ color: palette.inkSoft }}
            >
              Join {BRAND_NAME} to save your wishlist, track orders, and unlock
              member-only drops.
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
                id="username"
                name="username"
                label="Full name"
                type="text"
                value={formData.username}
                onChange={handleChange("username")}
                onBlur={handleBlur("username")}
                placeholder="Jane Doe"
                icon={User}
                error={errors.username}
                touched={touched.username}
                autoComplete="name"
                disabled={isLoading}
              />
            </motion.div>

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

            <motion.div variants={fieldVariants}>
              <ConfirmPasswordField
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                password={formData.password}
                onChange={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={fieldVariants} className="pt-1">
              <TermsCheckbox
                checked={agreeTerms}
                onChange={handleTermsChange}
                disabled={isLoading}
              />
              <AnimatePresence>
                {termsError && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="signup-hd-sans flex items-center gap-1.5 text-[12px] font-medium overflow-hidden mt-2"
                    style={{ color: palette.danger }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                    You must accept the Terms to continue.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fieldVariants} className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  signup-hd-sans
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
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
                    className="signup-hd-sans px-3 text-[10.5px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      background: palette.bg,
                      color: palette.inkMuted,
                    }}
                  >
                    or
                  </span>
                </div>
              </div>

              <GoogleButton
                onClick={handleGoogleSignup}
                disabled={isLoading}
              />
            </motion.div>
          </form>

          {/* Footer link */}
          <motion.p
            variants={fieldVariants}
            className="signup-hd-sans mt-8 text-center text-[13px] sm:text-[13.5px]"
            style={{ color: palette.inkSoft }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="
                font-semibold hover:underline
                outline-none focus:outline-none focus-visible:outline-none
              "
              style={{ color: palette.accent }}
            >
              Sign in
            </Link>
          </motion.p>

          {/* Trust line */}
          <motion.div
            variants={fieldVariants}
            className="mt-6 flex items-center justify-center gap-2 text-[11px]"
            style={{ color: palette.inkMuted }}
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            <span className="signup-hd-sans">
              Protected by 256-bit SSL encryption
            </span>
          </motion.div>
        </motion.section>
      </div>

      <SuccessOverlay show={success} />
    </motion.main>
  );
}

export default memo(Signup);