"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SUBTITLES = [
  "Stripe doesn't work in Malaysia or Singapore.",
  "Western platforms take 10–30% of every sale.",
  "Your buyers can't pay with DuitNow or PayNow.",
  "Kajabi, Gumroad, Teachable — none built for SEA.",
];

const FEATURES = [
  {
    emoji: "💳",
    title: "Local payment rails",
    desc: "DuitNow, PayNow, GCash, GoPay, MoMo, PromptPay — payments your buyers actually use.",
  },
  {
    emoji: "✦",
    title: "Just 5% flat fee",
    desc: "No monthly subscription. No per-seat pricing. You keep 95% of every sale.",
    accentEmoji: true,
  },
  {
    emoji: "⚡",
    title: "Auto Telegram & WhatsApp gating",
    desc: "Buyer pays → instantly added to your group. Zero manual work, zero dropped members.",
  },
  {
    emoji: "📦",
    title: "Sell anything",
    desc: "Courses, coaching, paid communities, digital downloads — all under one roof.",
  },
];

export default function WaitlistPage() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      timerRef.current = setTimeout(() => {
        setSubtitleIdx((i) => (i + 1) % SUBTITLES.length);
        setFading(false);
      }, 280);
    }, 2800);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Nav (identical to homepage) ── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Kreato
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-16 pb-24">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          Joining the waitlist is free
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight max-w-3xl mb-5">
          Sell your knowledge.{" "}
          <span className="text-violet-600 whitespace-nowrap">Get paid in SEA.</span>
        </h1>

        {/* Rotating subtitle */}
        <div className="h-7 mb-10 flex items-center justify-center">
          <p
            className="text-lg text-gray-500 max-w-xl transition-opacity duration-200"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {SUBTITLES[subtitleIdx]}
          </p>
        </div>

        {/* Form */}
        <WaitlistForm />

        {/* Social proof */}
        <p className="mt-5 text-sm text-gray-400">
          🇲🇾 🇸🇬 🇵🇭 🇮🇩&nbsp;&nbsp;
          <span className="font-medium text-gray-500">
            847 creators already waiting
          </span>
        </p>
      </main>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            Kreato is built differently.
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-lg">
            Everything you need to monetise your audience in SEA — and nothing
            you don&apos;t.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div
                  className={`mb-3 ${
                    f.accentEmoji
                      ? "text-lg font-black text-violet-600"
                      : "text-2xl"
                  }`}
                >
                  {f.accentEmoji ? "5%" : f.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">
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

      {/* ── Footer (identical to homepage) ── */}
      <footer className="px-6 py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Kreato. Built for SEA.</span>
          <div className="flex items-center gap-5">
            <a
              href="mailto:nick@getkreato.com"
              className="hover:text-gray-600 transition-colors"
            >
              Contact
            </a>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WaitlistForm() {
  const [role, setRole] = useState<"creator" | "buyer">("creator");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    const supabase = createClient();

    const { error: dbErr } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      role,
    });

    if (dbErr) {
      setError(
        dbErr.code === "23505"
          ? "You're already on the list!"
          : dbErr.message
      );
      setSubmitting(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 w-full max-w-md mx-auto">
        <div className="w-11 h-11 rounded-full bg-violet-50 flex items-center justify-center text-xl">
          🎉
        </div>
        <p className="font-semibold text-gray-900 text-lg">
          You&apos;re on the list!
        </p>
        <p className="text-gray-500 text-sm">
          We&apos;ll reach out when Kreato launches.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto flex flex-col items-center gap-4"
    >
      {/* Creator / Buyer toggle */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {(["creator", "buyer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              role === r
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {r === "creator" ? "I'm a Creator" : "I'm a Buyer"}
          </button>
        ))}
      </div>

      {/* Email + button row */}
      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary px-6 py-2.5 text-sm whitespace-nowrap"
        >
          {submitting ? "Joining…" : "Join the waitlist →"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </form>
  );
}
