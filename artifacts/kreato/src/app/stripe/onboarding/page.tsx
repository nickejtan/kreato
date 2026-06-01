"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StripeOnboardingPage() {
  const [status, setStatus] = useState("Setting up your payment account…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("/api/stripe/create-connect-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email ?? "",
          }),
        });

        if (!res.ok) throw new Error("Failed to create Stripe account");

        const { url } = await res.json();
        setStatus("Redirecting to bank setup…");
        window.location.href = url;
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }

    run();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <a href="/dashboard" className="text-sm text-violet-600 font-medium hover:underline">
            Skip for now → go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-sm font-medium text-gray-700">{status}</p>
        <p className="text-xs text-gray-400 mt-1">This only takes a moment</p>
      </div>
    </div>
  );
}
