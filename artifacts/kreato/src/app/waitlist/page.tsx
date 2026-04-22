"use client";

import { useEffect, useRef, useState } from "react";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { createClient } from "@/lib/supabase/client";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const SUBTITLES = [
  "Stripe doesn't work in Malaysia or Singapore.",
  "Western platforms take 10–30% of every sale.",
  "Your buyers can't pay with DuitNow or PayNow.",
  "Kajabi, Gumroad, Teachable — none built for SEA.",
];

const FEATURES = [
  {
    icon: "💳",
    title: "Local payment rails",
    desc: "DuitNow, PayNow, GCash, GoPay, MoMo, PromptPay — payments your buyers actually use.",
  },
  {
    icon: "5%",
    title: "Just 5% flat fee",
    desc: "No monthly subscription. No per-seat pricing. You keep 95% of every sale.",
    iconIsText: true,
  },
  {
    icon: "⚡",
    title: "Auto Telegram & WhatsApp gating",
    desc: "Buyer pays → instantly gets added to your group. Zero manual work.",
  },
  {
    icon: "📦",
    title: "Sell anything",
    desc: "Courses, coaching, paid communities, digital downloads — all in one place.",
  },
];

const PAINS = [
  {
    icon: "🚫",
    title: "Stripe not available here",
    desc: "Malaysia, Philippines, Vietnam — Stripe still doesn't fully work. Your buyers bounce at checkout.",
  },
  {
    icon: "📉",
    title: "Fees that kill margins",
    desc: "Kajabi charges RM500+/mo before you make a single sale. Teachable takes 10%. It adds up fast.",
  },
  {
    icon: "🌍",
    title: "Built for the West",
    desc: "Every tool assumes USD, USD banks, and USD buyers. SEA creators are an afterthought.",
  },
  {
    icon: "💬",
    title: "Your community is on Telegram",
    desc: "Yet no platform integrates with it. You're manually adding members every time someone pays.",
  },
];

function WaitlistForm({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess?: () => void;
}) {
  const [role, setRole] = useState<"creator" | "buyer">("creator");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");

    setSubmitting(true);
    const supabase = createClient();

    const { error: dbErr } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      role,
    });

    if (dbErr) {
      if (dbErr.code === "23505") {
        setError("You're already on the waitlist!");
      } else {
        setError(dbErr.message);
      }
      setSubmitting(false);
      return;
    }

    setDone(true);
    onSuccess?.();
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-12 h-12 rounded-full bg-[#0052FF]/10 flex items-center justify-center text-2xl">
          🎉
        </div>
        <p
          className="font-semibold text-gray-900 text-lg"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          You&apos;re on the list!
        </p>
        <p className="text-gray-500 text-sm">
          We&apos;ll reach out when Kreato launches.
        </p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      {/* Toggle */}
      <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 mb-4 w-fit mx-auto">
        {(["creator", "buyer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              role === r
                ? "bg-[#0052FF] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {r === "creator" ? "I'm a Creator" : "I'm a Buyer"}
          </button>
        ))}
      </div>

      {/* Email input + button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0052FF]/40 focus:border-[#0052FF] transition-all"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-[#0052FF] hover:bg-[#0041cc] text-white font-semibold text-sm transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {submitting ? "Joining…" : "Join Waitlist →"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
    </form>
  );
}

export default function WaitlistPage() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function cycle() {
      setFading(true);
      timerRef.current = setTimeout(() => {
        setSubtitleIdx((i) => (i + 1) % SUBTITLES.length);
        setFading(false);
      }, 300);
    }

    const interval = setInterval(cycle, 2800);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`${bricolage.variable} ${dmSans.variable} min-h-screen bg-white text-gray-900`}
      style={{ fontFamily: "var(--font-dm)" }}
    >
      {/* ── Nav ───────────────────────────────────────── */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span
              className="font-bold text-gray-900 text-lg tracking-tight"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Kreato
            </span>
          </div>
          <a
            href="#bottom-cta"
            className="text-sm font-medium text-[#0052FF] hover:text-[#0041cc] transition-colors"
          >
            Get early access →
          </a>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0052FF]/8 text-[#0052FF] text-xs font-semibold mb-8 tracking-wide uppercase">
          Early Access — Limited Spots
        </div>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Sell your knowledge.
          <br />
          Get paid in SEA.
        </h1>

        {/* Rotating subtitle */}
        <div className="h-8 mb-10 flex items-center justify-center">
          <p
            className="text-lg text-gray-500 max-w-xl mx-auto transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {SUBTITLES[subtitleIdx]}
          </p>
        </div>

        <WaitlistForm id="hero-form" />

        {/* Social proof */}
        <p className="mt-5 text-sm text-gray-400">
          <span className="font-semibold text-gray-600">
            847 creators already waiting
          </span>{" "}
          &nbsp;🇲🇾 🇸🇬 🇵🇭 🇮🇩
        </p>
      </section>

      {/* ── Pain section ──────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Every tool was built for someone else.
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            If you&apos;re a creator in Southeast Asia, you&apos;ve hit these
            walls.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PAINS.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3
                  className="font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features section ──────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Kreato is built differently.
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Everything you need to monetise your audience in SEA — and nothing
            you don&apos;t.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 border border-gray-100 bg-white shadow-sm hover:border-[#0052FF]/30 transition-colors"
              >
                <div
                  className={`mb-3 ${
                    f.iconIsText
                      ? "text-lg font-black text-[#0052FF]"
                      : "text-2xl"
                  }`}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────── */}
      <section
        id="bottom-cta"
        className="py-20 px-6 bg-[#0052FF] text-white text-center"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Be the first to launch on Kreato.
          </h2>
          <p className="text-blue-100 mb-10 text-lg">
            We&apos;re onboarding our first 100 creators. Secure your spot now.
          </p>

          {/* Replicate form but white on blue */}
          <BottomForm />

          <p className="text-blue-200 text-xs mt-5">
            No spam. No credit card. Just early access.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span
              className="font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Kreato
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Questions?{" "}
            <a
              href="mailto:nick@getkreato.com"
              className="text-[#0052FF] hover:underline"
            >
              nick@getkreato.com
            </a>
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Kreato. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BottomForm() {
  const [role, setRole] = useState<"creator" | "buyer">("creator");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");

    setSubmitting(true);
    const supabase = createClient();

    const { error: dbErr } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      role,
    });

    if (dbErr) {
      if (dbErr.code === "23505") {
        setError("You're already on the waitlist!");
      } else {
        setError(dbErr.message);
      }
      setSubmitting(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <span className="text-3xl">🎉</span>
        <p
          className="font-semibold text-white text-lg"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          You&apos;re on the list!
        </p>
        <p className="text-blue-200 text-sm">
          We&apos;ll reach out when Kreato launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex rounded-xl border border-white/20 bg-white/10 p-1 mb-4 w-fit mx-auto">
        {(["creator", "buyer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              role === r
                ? "bg-white text-[#0052FF] shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
          >
            {r === "creator" ? "I'm a Creator" : "I'm a Buyer"}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm outline-none focus:ring-2 focus:ring-white/40 transition-all"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-white text-[#0052FF] font-semibold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {submitting ? "Joining…" : "Join Waitlist →"}
        </button>
      </div>

      {error && (
        <p className="text-red-200 text-xs mt-2 text-center">{error}</p>
      )}
    </form>
  );
}
