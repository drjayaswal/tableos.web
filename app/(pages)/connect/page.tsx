"use client"

import { cn } from "../../lib/utils";
import { apiRequest } from "../../utility/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { AddressSuggestion, searchAddressSuggestions } from "@/app/utility/geocoding";
import { Button } from "@/app/components/ui/button";
import { LocationIcon, TableIcon } from "@/app/components/icons/svg";

function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8H18C19.0609 8 20.0783 8.42143 20.8284 9.17157C21.5786 9.92172 22 10.9391 22 12C22 13.0609 21.5786 14.0783 20.8284 14.8284C20.0783 15.5786 19.0609 16 18 16H17M17 8H3V17C3 18.0609 3.42143 19.0783 4.17157 19.8284C4.92172 20.5786 5.93913 21 7 21H13C14.0609 21 15.0783 20.5786 15.8284 19.8284C16.5786 19.0783 17 18.0609 17 17V8ZM6 1V4M10 1V4M14 1V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForkKnifeIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2V10C3 11.1046 3.89543 12 5 12H7C8.10457 12 9 11.1046 9 10V2M6 12V22M17 2V7C17 8.5 18 10 20 10M17 15H20L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4V20M2 16H22V20M2 12H10V16M22 12V20M14 12H18C19.1046 12 20 11.1046 20 10V8C20 6.89543 19.1046 6 18 6H14C12.8954 6 12 6.89543 12 8V10C12 11.1046 12.8954 12 14 12ZM6 12C7.65685 12 9 10.6569 9 9C9 7.34315 7.65685 6 6 6C4.34315 6 3 7.34315 3 9C3 10.6569 4.34315 12 6 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CURRENCY_OPTIONS = [
  { label: "INR (₹)", value: "INR" },
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
];

type View = "landing" | "create" | "signin";
type CreateStep = "category" | "form" | "otp";
type SignInStep = "email" | "owner_password" | "staff_otp";
type HorecaCategory = "cafe" | "hotel" | "restaurant";
type UserRole = "owner" | "staff" | "customer";

const PASSWORD_ROLES: UserRole[] = ["owner", "staff"];

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 28, stiffness: 220 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 28, stiffness: 220, delay: i * 0.06 },
  }),
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8 md:p-10">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute bottom-4 left-4 items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm shadow-black/25 border border-gray-200 p-1">
        <Image src="/assets/tableOS-logo.svg" alt="TableOS Logo" width={20} height={20} />
      </div>
    </div>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  fullWidth = false,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center h-11",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="opacity-80">Processing...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

function SecondaryButton({
  onClick,
  children,
  fullWidth = false,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center shadow-none! border-0! h-11",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </Button>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  suffix,
  error,
  disabled,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suffix?: React.ReactNode;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-black">{label}</label>
      <div
        className={cn(
          "flex items-center border-2 rounded-xl bg-white transition-all duration-150",
          error ? "border-red-300 focus-within:border-red-400" : "border-gray-200/50 focus-within:border-gray-200",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={() => setTimeout(() => onBlur?.(), 200)}
          className="flex-1 px-4 py-3 text-sm text-black font-bold placeholder-gray-400 bg-transparent outline-none min-w-0"
        />
        {suffix && <span className="pr-3.5 shrink-0">{suffix}</span>}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 font-medium flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9998 8.99999V13M11.9998 17H12.0098M10.6151 3.89171L2.39019 18.0983C1.93398 18.8863 1.70588 19.2803 1.73959 19.6037C1.769 19.8857 1.91677 20.142 2.14613 20.3088C2.40908 20.5 2.86435 20.5 3.77487 20.5H20.2246C21.1352 20.5 21.5904 20.5 21.8534 20.3088C22.0827 20.142 22.2305 19.8857 22.2599 19.6037C22.2936 19.2803 22.0655 18.8863 21.6093 18.0983L13.3844 3.89171C12.9299 3.10654 12.7026 2.71396 12.4061 2.58211C12.1474 2.4671 11.8521 2.4671 11.5935 2.58211C11.2969 2.71396 11.0696 3.10655 10.6151 3.89171Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? "text" : "password"}
      placeholder="••••••••"
      value={value}
      onChange={onChange}
      disabled={disabled}
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
        >
          {show ?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            :
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7429 5.09232C11.1494 5.03223 11.5686 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7767C21.8518 11.9016 21.8517 12.0987 21.8231 12.2236C21.7849 12.3899 21.7164 12.4985 21.5792 12.7156C21.2793 13.1901 20.8222 13.8571 20.2165 14.5805M6.72432 6.71504C4.56225 8.1817 3.09445 10.2194 2.42111 11.2853C2.28428 11.5019 2.21587 11.6102 2.17774 11.7765C2.1491 11.9014 2.14909 12.0984 2.17771 12.2234C2.21583 12.3897 2.28393 12.4975 2.42013 12.7132C3.54554 14.4952 6.89541 19 12.0004 19C14.0588 19 15.8319 18.2676 17.2888 17.2766M3.00042 3L21.0004 21M9.8791 9.87868C9.3362 10.4216 9.00042 11.1716 9.00042 12C9.00042 13.6569 10.3436 15 12.0004 15C12.8288 15 13.5788 14.6642 14.1217 14.1213" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        </button>
      }
      error={error}
    />
  );
}

function AlertBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 flex text-red-700 items-center gap-2.5 bg-red-500/10 rounded-xl"
    >
      <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.9998 8.99999V13M11.9998 17H12.0098M10.6151 3.89171L2.39019 18.0983C1.93398 18.8863 1.70588 19.2803 1.73959 19.6037C1.769 19.8857 1.91677 20.142 2.14613 20.3088C2.40908 20.5 2.86435 20.5 3.77487 20.5H20.2246C21.1352 20.5 21.5904 20.5 21.8534 20.3088C22.0827 20.142 22.2305 19.8857 22.2599 19.6037C22.2936 19.2803 22.0655 18.8863 21.6093 18.0983L13.3844 3.89171C12.9299 3.10654 12.7026 2.71396 12.4061 2.58211C12.1474 2.4671 11.8521 2.4671 11.5935 2.58211C11.2969 2.71396 11.0696 3.10655 10.6151 3.89171Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs text-red-700 font-bold">{message}</p>
    </motion.div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors font-bold cursor-pointer mb-4 sm:mb-6"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8L8 12M8 12L12 16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

function StepDots({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex gap-1 mb-4 sm:mb-6">
      {steps.map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i <= current ? "bg-black" : "bg-gray-300",
            i === current ? "w-6" : "w-3"
          )}
        />
      ))}
    </div>
  );
}

function OTPInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) { next[i] = ""; onChange(next.join("")); }
      else if (i > 0) { next[i - 1] = ""; onChange(next.join("")); inputs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    onChange(next.join(""));
    if (ch && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    toast.success("OTP pasted!");
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-2.5 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="off"
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 text-center text-lg font-bold border-2 rounded-[20px] outline-none transition-all duration-150 bg-white",
            d ? "border-green-500 text-black" : "border-gray-200/50 hover:border-gray-200 focus:border-red-500 text-black",
          )}
        />
      ))}
    </div>
  );
}

function OTPScreen({
  email, otp, setOtp, otpError, loading, resendTimer,
  onVerify, onResend, onBack, sublabel, ctaText,
}: {
  email: string; otp: string; setOtp: (v: string) => void;
  otpError: string; loading: boolean; resendTimer: number;
  onVerify: () => void; onResend: () => void; onBack: () => void;
  sublabel: string; ctaText: string;
}) {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <Card>
        <BackButton label="Back" onClick={onBack} />

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7L10.1649 12.7154C10.8261 13.1783 11.1567 13.4097 11.5163 13.4993C11.8339 13.5785 12.1661 13.5785 12.4837 13.4993C12.8433 13.4097 13.1739 13.1783 13.8351 12.7154L22 7M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-black mb-1">Check your email</h1>
          <p className="text-sm text-gray-500">{sublabel}</p>
          <p className="text-sm font-semibold text-black mt-0.5 break-all">{email}</p>
        </div>

        <div className="space-y-4 sm:space-y-5">

          <OTPInput value={otp} onChange={setOtp} />

          {otpError && <AlertBanner message={otpError} />}

          <PrimaryButton onClick={onVerify} loading={loading} disabled={otp.length < 6} fullWidth>
            {ctaText}
          </PrimaryButton>

          <p className="text-center text-sm text-gray-500">
            {resendTimer > 0 ? (
              <>Resend in <span className="font-semibold text-black">{resendTimer}s</span></>
            ) : (
              <button onClick={onResend} className="font-semibold text-black hover:underline cursor-pointer">
                Resend code
              </button>
            )}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

const categoryMeta: Record<HorecaCategory, { label: string; desc: string; icon: React.ReactNode }> = {
  cafe: { label: "Café", desc: "Coffee shops & casual dining", icon: <CoffeeIcon /> },
  restaurant: { label: "Restaurant", desc: "Full-service dining experience", icon: <ForkKnifeIcon /> },
  hotel: { label: "Hotel", desc: "Hospitality & in-room dining", icon: <BedIcon /> },
};

function CategoryCard({ type, selected, onClick }: { type: HorecaCategory; selected: boolean; onClick: () => void }) {
  const meta = categoryMeta[type];

  const transition = "transition-all duration-500 ease-in-out";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center bg-white gap-3.5 px-4 py-3.5 rounded-lg text-left cursor-pointer border border-transparent",
        transition,
        selected && "border-gray-200 shadow-sm shadow-black/25"
      )}
    >
      <div className={cn("p-2 rounded-md shadow-none border border-transparent", transition, selected && "border-gray-200 rounded-md shadow-sm shadow-black/15")}>
        <span className={cn(transition, selected ? "text-black" : "text-gray-400")}>
          {meta.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("font-bold text-sm", transition, selected ? "text-black" : "text-gray-400")}>
          {meta.label}
        </p>
        <p className={cn("text-xs font-medium mt-0.5", transition, selected ? "text-black" : "text-gray-400")}>
          {meta.desc}
        </p>
      </div>

      {selected &&
        <div className="text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      }
    </button>
  );
}

export default function ConnectPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("landing");
  const [createStep, setCreateStep] = useState<CreateStep>("category");
  const [signInStep, setSignInStep] = useState<SignInStep>("email");
  const [category, setCategory] = useState<HorecaCategory | null>(null);

  const [createForm, setCreateForm] = useState({
    storeName: "", address: "", ownerName: "", email: "", password: "",
    tables: 2, lat: undefined as number | undefined, lon: undefined as number | undefined,
    currency: "INR", openTime: "09:00", closeTime: "22:00",
  });
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof typeof createForm, string>>>({});

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [detectedRole, setDetectedRole] = useState<UserRole | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [otpPurpose, setOtpPurpose] = useState<"sign-in" | "email-verification">("email-verification");

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const startResendTimer = () => setResendTimer(30);

  const handleAddressChange = (val: string) => {
    setCreateForm((f) => ({ ...f, address: val, lat: undefined, lon: undefined }));
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 400);
  };

  const selectSuggestion = (s: AddressSuggestion) => {
    setCreateForm((f) => ({ ...f, address: s.display_name, lat: s.lat, lon: s.lon }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const validateCreate = () => {
    const errs: Partial<Record<keyof typeof createForm, string>> = {};
    if (!createForm.storeName.trim()) errs.storeName = "Business name is required";
    if (!createForm.ownerName.trim()) errs.ownerName = "Your name is required";
    if (!createForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email";
    if (createForm.password.length < 8) errs.password = "Password must be 8+ characters";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = useCallback(async () => {
    if (!validateCreate()) return;
    setLoading(true);
    setGlobalError("");
    try {
      const response = await apiRequest<{ status: number; message: string }>("/auth/connect/send/otp", {
        method: "POST",
        body: { email: createForm.email },
      });

      if (response.status !== 200) {
        setGlobalError(response.message);
        return;
      }

      toast.success("OTP sent to your email!");
      startResendTimer();
      setOtp("");
      setOtpError("");
      setCreateStep("otp");
    } catch (e: any) {
      setGlobalError(e.message || "Failed to initiate registration.");
    } finally {
      setLoading(false);
    }
  }, [createForm, category]);

  const handleCheckEmail = useCallback(async () => {
    if (!signInEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSignInErrors({ email: "Enter a valid email" });
      return;
    }
    setCheckingEmail(true);
    setGlobalError("");
    setSignInErrors({});
    try {
      const response = await apiRequest<{ status: number; message: string; data: any }>("/auth/continue/send/otp", {
        method: "POST",
        body: { email: signInEmail },
      });

      if (response.status === 200) {
        toast.success("Verification code sent to your email!");
        startResendTimer();
        setOtp("");
        setOtpError("");
        setOtpPurpose("sign-in");
        setDetectedRole("owner");
        setSignInStep("staff_otp");
      } else if (response.status === 400 && response.message.toLowerCase().includes("owner")) {
        setGlobalError(response.message);
      } else {
        setGlobalError(response.message || "Account not found or restricted.");
      }
    } catch (e: any) {
      setSignInStep("owner_password");
    } finally {
      setCheckingEmail(false);
    }
  }, [signInEmail]);

  const handleOwnerSignIn = useCallback(async () => {
    if (!signInPassword) { setSignInErrors({ password: "Password is required" }); return; }
    setLoading(true);
    setGlobalError("");
    try {
      const response = await apiRequest<{ status: number; message: string; data: any }>("/auth/continue/password", {
        method: "POST",
        body: { email: signInEmail, password: signInPassword },
      });

      if (response.status === 200) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        setGlobalError(response.message);
      }
    } catch (e: any) {
      setGlobalError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, [signInEmail, signInPassword, router]);

  const handleCreateOTPVerify = useCallback(async () => {
    if (otp.length < 6) { setOtpError("Enter the 6-digit code"); return; }
    setLoading(true);
    setOtpError("");
    try {
      const response = await apiRequest<{ status: number; message: string; data: any }>("/auth/connect/verify/otp", {
        method: "POST",
        body: {
          email: createForm.email,
          otp,
          name: createForm.storeName,
          address: createForm.address,
          category,
          currency: createForm.currency,
          tables: createForm.tables,
          lat: createForm.lat,
          lon: createForm.lon,
          password: createForm.password,
          timing: {
            monday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            tuesday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            wednesday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            thursday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            friday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            saturday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
            sunday: { is_open: true, open_time: createForm.openTime, close_time: createForm.closeTime },
          },
        },
      });

      if (response.status === 200) {
        toast.success("Store created successfully!");
        router.push("/");
      } else {
        setOtpError(response.message);
      }
    } catch (e: any) {
      setOtpError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [otp, createForm, category, router]);

  const handleStaffOTPVerify = useCallback(async () => {
    if (otp.length < 6) { setOtpError("Enter the 6-digit code"); return; }
    setLoading(true);
    setOtpError("");
    try {
      const response = await apiRequest<{ status: number; message: string; data: any }>("/auth/continue/verify/otp", {
        method: "POST",
        body: { email: signInEmail, otp },
      });

      if (response.status === 200) {
        toast.success("Verified!");
        router.push("/dashboard");
      } else {
        setOtpError(response.message);
      }
    } catch (e: any) {
      setOtpError(e.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }, [otp, signInEmail, router]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const email = view === "create" ? createForm.email : signInEmail;
    const endpoint = view === "create" ? "/auth/connect/send/otp" : "/auth/continue/send/otp";
    setOtpError("");
    setOtp("");
    try {
      const response = await apiRequest<{ status: number; message: string }>(endpoint, {
        method: "POST",
        body: { email },
      });
      if (response.status !== 200) { setGlobalError("Failed to resend: " + response.message); return; }
      toast.success("Code resent!");
      startResendTimer();
    } catch (e: any) {
      setGlobalError("Failed to resend: " + e.message);
    }
  };

  const resetAll = () => {
    setView("landing");
    setCreateStep("category");
    setSignInStep("email");
    setCategory(null);
    setOtp("");
    setOtpError("");
    setGlobalError("");
    setCreateErrors({});
    setSignInErrors({});
    setSignInEmail("");
    setSignInPassword("");
    setDetectedRole(null);
    setOtpPurpose("email-verification");
    setCreateForm({
      storeName: "", ownerName: "", email: "", password: "", address: "",
      lat: undefined, lon: undefined, tables: 1, currency: "INR",
      openTime: "09:00", closeTime: "22:00",
    });
  };

  const createSteps: CreateStep[] = ["category", "form", "otp"];
  const createStepIndex = createSteps.indexOf(createStep);

  const roleLabel = (role: UserRole | null) => {
    if (!role) return "";
    const labels: Record<UserRole, string> = {
      owner: "Owner",
      staff: "Staff",
      customer: "Customer",
    };
    return labels[role] || role;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <Logo />
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {view === "landing" && (
            <motion.div key="landing" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Card>
                <div className="text-center mb-6 sm:mb-8">
                  <motion.h1 variants={fadeUp} custom={0} initial="hidden" animate="visible" className="text-xl sm:text-2xl font-bold text-black mb-1.5">
                    Your workspace awaits
                  </motion.h1>
                  <motion.p variants={fadeUp} custom={1} initial="hidden" animate="visible" className="text-sm text-gray-500">
                    New business or returning? We got you.
                  </motion.p>
                </div>

                <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="space-y-3">
                  <PrimaryButton fullWidth onClick={() => { setView("create"); setCreateStep("category"); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 21V15.6C15 15.0399 15 14.7599 14.891 14.546C14.7951 14.3578 14.6422 14.2049 14.454 14.109C14.2401 14 13.9601 14 13.4 14H10.6C10.0399 14 9.75992 14 9.54601 14.109C9.35785 14.2049 9.20487 14.3578 9.10899 14.546C9 14.7599 9 15.0399 9 15.6V21M3 7C3 8.65685 4.34315 10 6 10C7.65685 10 9 8.65685 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 8.65685 16.3431 10 18 10C19.6569 10 21 8.65685 21 7M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V6.2C21 5.0799 21 4.51984 20.782 4.09202C20.5903 3.71569 20.2843 3.40973 19.908 3.21799C19.4802 3 18.9201 3 17.8 3H6.2C5.0799 3 4.51984 3 4.09202 3.21799C3.71569 3.40973 3.40973 3.71569 3.21799 4.09202C3 4.51984 3 5.07989 3 6.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Register your business
                  </PrimaryButton>

                  <SecondaryButton fullWidth onClick={() => { setView("signin"); setSignInStep("email"); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign in to your account
                  </SecondaryButton>
                </motion.div>

                <motion.p variants={fadeUp} custom={3} initial="hidden" animate="visible" className="text-center text-xs text-gray-400 mt-5 sm:mt-6">
                  by continuing you agree to{" "}
                  <span className="font-semibold text-black cursor-pointer hover:underline">Terms</span>{" "}
                  &{" "}
                  <span className="font-semibold text-black cursor-pointer hover:underline">Privacy Policy</span>
                </motion.p>
              </Card>
            </motion.div>
          )}

          {view === "create" && createStep === "category" && (
            <motion.div key="create-category" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Card>
                <BackButton label="Registration" onClick={resetAll} />
                <StepDots steps={createSteps} current={createStepIndex} />

                <div className="mb-5 sm:mb-6">
                  <h1 className="text-lg sm:text-xl font-bold text-black mb-1">What type of business?</h1>
                  <p className="text-sm text-gray-500">Select the category that best describes your establishment.</p>
                </div>

                <div className="space-y-2.5 mb-5 sm:mb-6">
                  {(["hotel", "restaurant", "cafe"] as HorecaCategory[]).map((cat) => (
                    <CategoryCard key={cat} type={cat} selected={category === cat} onClick={() => setCategory(cat)} />
                  ))}
                </div>

                <PrimaryButton fullWidth onClick={() => setCreateStep("form")} disabled={!category}>
                  Continue
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </PrimaryButton>
              </Card>
            </motion.div>
          )}

          {view === "create" && createStep === "form" && (
            <motion.div key="create-form" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Card>
                <BackButton label="Back" onClick={() => setCreateStep("category")} />
                <StepDots steps={createSteps} current={createStepIndex} />

                <div className="mb-5 sm:mb-6">
                  <h1 className="text-lg sm:text-xl font-bold text-black mb-1">
                    Tell us about your {category ? categoryMeta[category].label : "business"}
                  </h1>
                  <p className="text-sm text-gray-500">Set up your establishment details.</p>
                </div>

                <div className="flex items-center gap-2.5 px-3.5 py-2.5 shadow-sm border border-gray-200/70 rounded-xl mb-4 sm:mb-5">
                  <span className="text-gray-500 shrink-0">{category && categoryMeta[category].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Selected category</p>
                    <p className="text-sm font-semibold text-black">{category ? categoryMeta[category].label : ""}</p>
                  </div>
                  <Button variant={"tableos"} onClick={() => setCreateStep("category")} size="sm">Change</Button>
                </div>

                {globalError && <div className="mb-4"><AlertBanner message={globalError} /></div>}

                <div className="space-y-3.5 sm:space-y-4">
                  <Field
                    label="Business Name"
                    placeholder={`My ${category ? categoryMeta[category].label : "Business"}`}
                    value={createForm.storeName}
                    onChange={(v) => setCreateForm((f) => ({ ...f, storeName: v }))}
                    error={createErrors.storeName}
                  />

                  <div className="relative">
                    <Field
                      label="Address"
                      placeholder="Search for address..."
                      value={createForm.address}
                      onChange={handleAddressChange}
                      onBlur={() => setShowSuggestions(false)}
                    />
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectSuggestion(s)}
                              className="group w-full cursor-pointer text-left flex font-bold items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                              <div className="text-black">
                                <LocationIcon className="" />
                              </div>
                              <div className="min-w-0 font-bold">
                                <p className="text-sm text-black truncate">{s.display_name.split(",")[0]}</p>
                                <p className="text-xs text-gray-400 truncate">{s.display_name.split(",").slice(1).join(",").trim()}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-black">Tables</label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setCreateForm((f) => ({ ...f, tables: Math.max(1, f.tables - 1) }))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200/50 bg-white flex items-center justify-center hover:border-gray-200 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div className="flex flex-col items-center min-w-[48px]">
                        <span className="text-2xl font-black text-black tabular-nums">{createForm.tables}</span>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Units</span>
                      </div>

                      {/* Increase Button */}
                      <button
                        type="button"
                        onClick={() => setCreateForm((f) => ({ ...f, tables: f.tables + 1 }))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200/50 bg-white flex items-center justify-center hover:border-gray-200 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div className="hidden sm:flex flex-wrap gap-1.5 flex-1 items-center">
                        {Array.from({ length: Math.min(createForm.tables, 6) }).map((_, i) => (
                          <motion.div key={i}>
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                            >
                              <TableIcon className="w-5 h-5" />
                            </motion.div>
                          </motion.div>
                        ))}

                        {createForm.tables > 6 && (
                          <span className="text-xs font-bold text-gray-500 self-center">
                            +{createForm.tables - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Field
                    label="Owner Email"
                    type="email"
                    placeholder="owner@gmail.com"
                    value={createForm.email}
                    onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))}
                    error={createErrors.email}
                  />
                  <Field
                    label="Your Name"
                    placeholder="Full name"
                    value={createForm.ownerName}
                    onChange={(v) => setCreateForm((f) => ({ ...f, ownerName: v }))}
                    error={createErrors.ownerName}
                  />
                  <PasswordField
                    label="Password"
                    value={createForm.password}
                    onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))}
                    error={createErrors.password}
                  />

                  <PrimaryButton fullWidth onClick={handleCreateSubmit} loading={loading} disabled={!category}>
                    Create Account
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </PrimaryButton>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button onClick={() => { setView("signin"); setSignInStep("email"); }} className="font-semibold text-black hover:underline cursor-pointer">
                      Sign in
                    </button>
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {view === "create" && createStep === "otp" && (
            <OTPScreen
              key="create-otp"
              email={createForm.email}
              otp={otp} setOtp={setOtp} otpError={otpError}
              loading={loading} resendTimer={resendTimer} onVerify={handleCreateOTPVerify}
              onResend={handleResend} onBack={() => setCreateStep("form")}
              sublabel="We sent a 6-digit code to" ctaText="Verify & Launch"
            />
          )}

          {view === "signin" && signInStep === "email" && (
            <motion.div key="signin-email" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Card>
                <BackButton label="Back" onClick={resetAll} />

                <div className="mb-5 sm:mb-6">
                  <h1 className="text-lg sm:text-xl font-bold text-black mb-1">Sign in to your account</h1>
                  <p className="text-sm text-gray-500">Welcome back — enter your email and we'll route you correctly.</p>
                </div>

                {globalError && <div className="mb-4"><AlertBanner message={globalError} /></div>}

                <div className="space-y-4">
                  <Field
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    value={signInEmail}
                    onChange={(v) => { setSignInEmail(v); setGlobalError(""); }}
                    error={signInErrors.email}
                  />

                  <PrimaryButton onClick={handleCheckEmail} loading={checkingEmail} fullWidth>
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </PrimaryButton>

                  <Divider label="or" />

                  <p className="text-center text-sm text-gray-500">
                    No account?{" "}
                    <button onClick={() => { setView("create"); setCreateStep("category"); }} className="font-semibold text-black hover:underline cursor-pointer">
                      Register your business
                    </button>
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
          {view === "signin" && signInStep === "owner_password" && (
            <motion.div key="signin-password" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Card>
                <BackButton label="Back" onClick={() => { setSignInStep("email"); setGlobalError(""); setSignInErrors({}); }} />

                <div className="mb-5 sm:mb-6">
                  <h1 className="text-lg sm:text-xl font-bold text-black mb-1">
                    {roleLabel(detectedRole)} Access
                  </h1>
                  <p className="text-sm text-gray-500">Enter your password to continue</p>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl mb-4 sm:mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Signing in as <span className="font-semibold text-gray-600">{roleLabel(detectedRole)}</span></p>
                    <p className="text-sm font-semibold text-black truncate">{signInEmail}</p>
                  </div>
                  <Button onClick={() => setSignInStep("email")} size="sm">Change</Button>
                </div>

                {globalError && <div className="mb-4"><AlertBanner message={globalError} /></div>}

                <div className="space-y-4">
                  <PasswordField
                    label="Password"
                    value={signInPassword}
                    onChange={(v) => { setSignInPassword(v); setGlobalError(""); }}
                    error={signInErrors.password}
                  />

                  <div className="text-right">
                    <button className="text-sm font-medium text-gray-500 hover:text-black transition-colors cursor-pointer">
                      Forgot password?
                    </button>
                  </div>

                  <PrimaryButton onClick={handleOwnerSignIn} loading={loading} fullWidth>
                    Sign In
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </PrimaryButton>
                </div>
              </Card>
            </motion.div>
          )}
          {view === "signin" && signInStep === "staff_otp" && (
            <OTPScreen
              key="staff-otp"
              email={signInEmail} otp={otp} setOtp={setOtp} otpError={otpError}
              loading={loading} resendTimer={resendTimer} onVerify={handleStaffOTPVerify}
              onResend={handleResend} onBack={() => { setSignInStep("email");}}
              sublabel="We sent a verification code to" ctaText="Confirm & Enter"
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}