"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MetaPixelScript from "@/components/MetaPixelScript";

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
      <MetaPixelScript />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">Log in</Link>
          <Link href="/signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-16 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          Now launching in Malaysia &amp; Singapore
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight max-w-4xl mb-5">
          The New Way For Creators To Make Money From Their Followers
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-8">
          Kreato gives SEA creators a simple way to earn directly from their followers and get paid instantly.
        </p>

        {/* Pain points */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-violet-600 font-bold">✓</span>
            Local payments — DuitNow, PayNow, GCash &amp; more
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-600 font-bold">✓</span>
            No Stripe. No PayPal headaches.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-600 font-bold">✓</span>
            Auto-gate your Telegram or WhatsApp group
          </div>
        </div>

        <WaitlistForm buttonText="Get Early Access" />

        {/* Social proof */}
        <p className="mt-6 text-sm text-gray-400 max-w-sm">
          Built by a creator who&apos;s done{" "}
          <span className="font-semibold text-gray-600">$4M+ in info product sales</span> and worked with{" "}
          <span className="font-semibold text-gray-600">1,000+ clients</span> — because SEA creators deserved better.
        </p>
      </main>

      {/* Creator cards — #F5F5F5 background */}
      <section className="bg-[#F5F5F5] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            What creators are selling on Kreato
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-lg">
            From food to finance — if you have followers, you can earn with Kreato.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CREATOR_CARDS.map((c) => (
              <div key={c.title} className="card p-6">
                <div className="text-2xl mb-3">{c.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for SEA — white background */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            Built for SEA
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-lg">
            Everything you need to get paid by your followers — without the Western platform headaches.
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
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA — violet-600 background */}
      <section className="bg-violet-600 py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Ready to make money from your followers?
          </h2>
          <p className="text-violet-200 text-lg mb-10">
            Join SEA creators getting early access to Kreato.
          </p>
          <WaitlistForm buttonText="Get Early Access" dark />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Kreato. Built for SEA.</span>
          <div className="flex items-center gap-5">
            <a href="mailto:nick@getkreato.com" className="hover:text-gray-600 transition-colors">Contact</a>
            <Link href="#" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WaitlistForm({ buttonText, dark }: { buttonText: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: dbErr } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      instagram: instagram.trim().replace(/^@/, "").toLowerCase(),
      country: country,
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

    window.location.href = "/thank-you";
  }

  const inputClass = `w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
    dark
      ? "bg-white/10 border-white/20 text-white placeholder:text-violet-200 focus:border-white"
      : "border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 input-field"
  }`;

  const selectClass = `w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
    dark
      ? "bg-white/10 border-white/20 text-white focus:border-white"
      : "border-gray-200 text-gray-900 focus:border-violet-500 input-field"
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[480px] mx-auto flex flex-col gap-3"
    >
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Instagram handle (e.g. @yourcreatorname)"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        required
        className={inputClass}
      />
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        className={selectClass}
      >
        <option value="" disabled>Select your country</option>
        <option value="Malaysia">🇲🇾 Malaysia</option>
        <option value="Singapore">🇸🇬 Singapore</option>
      </select>
      <button
        type="submit"
        disabled={submitting}
        className={`w-full px-6 py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          dark
            ? "bg-white text-violet-600 hover:bg-violet-50"
            : "btn-primary"
        }`}
      >
        {submitting ? "Joining…" : buttonText}
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </form>
  );
}
