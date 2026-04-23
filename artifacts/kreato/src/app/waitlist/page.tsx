"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const CREATOR_CARDS = [
  {
    emoji: "🍜",
    title: "Food creators",
    desc: "Teaching others how to create content, work with restaurants and charge their worth.",
  },
  {
    emoji: "💪",
    title: "Fitness creators",
    desc: "Selling weekly workout plans and coaching calls directly to their followers.",
  },
  {
    emoji: "📸",
    title: "Photography creators",
    desc: "Teaching beginners how to shoot and edit on their phone.",
  },
  {
    emoji: "💄",
    title: "Beauty creators",
    desc: "Running a paid Telegram group with exclusive tutorials and tips.",
  },
  {
    emoji: "💰",
    title: "Finance creators",
    desc: "Charging followers for weekly market breakdowns and investment insights.",
  },
  {
    emoji: "🎤",
    title: "Lifestyle creators",
    desc: "Selling 1-on-1 coaching on how to grow on Instagram and TikTok.",
  },
];

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Nav ── */}
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
          Now live in Malaysia &amp; Singapore
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight max-w-4xl mb-5">
          The New Way For Creators To Make Money From Their Followers
        </h1>

        {/* Subtitle */}
        <div className="mb-10 flex items-center justify-center">
          <p className="text-lg text-gray-500 max-w-xl">
            Kreato gives SEA creators a simple way to earn directly from their
            followers and get paid instantly.
          </p>
        </div>

        {/* Form */}
        <WaitlistForm buttonText="Get Early Access" />

        {/* Social proof */}
        <p className="mt-5 text-sm text-gray-400">
          🇲🇾 🇸🇬 🇵🇭 🇮🇩&nbsp;&nbsp;
          <span className="font-medium text-gray-500">
            Creators across Southeast Asia are already on the list.
          </span>
        </p>
      </main>

      {/* ── Creator cards section ── */}
      <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            What creators are selling on Kreato
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-lg">
            From food to finance — if you have followers, you can earn with
            Kreato.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CREATOR_CARDS.map((c) => (
              <div key={c.title} className="card p-6">
                <div className="text-2xl mb-3">{c.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {c.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for SEA ── */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            Built for SEA
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-lg">
            Everything you need to get paid by your followers — without the
            Western platform headaches.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                emoji: "💳",
                title: "Local payments, built in",
                desc: "Your followers pay with DuitNow, PayNow, GCash and every major SEA payment method. No Stripe needed.",
              },
              {
                emoji: "⚡",
                title: "Get paid instantly",
                desc: "Money hits your account the moment someone buys. No waiting. No chasing.",
              },
              {
                emoji: "🔒",
                title: "Automatic access control",
                desc: "Sell access to your Telegram group or exclusive content. Kreato handles everything automatically when someone pays.",
              },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="text-2xl mb-3">{f.emoji}</div>
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

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Ready to make money from your followers?
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of SEA creators already on the waitlist.
          </p>
          <WaitlistForm buttonText="Get Early Access" />
        </div>
      </section>

      {/* ── Footer ── */}
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

function WaitlistForm({ buttonText }: { buttonText: string }) {
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
      role: "creator",
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
      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
        <input
          type="email"
          placeholder="Enter your email"
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
          {submitting ? "Joining…" : buttonText}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </form>
  );
}
