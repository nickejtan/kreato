"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StripeOnboardingPage() {
  const [status, setStatus] = useState("Confirming your account…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();

      // Wait briefly for PKCE code exchange to complete (detectSessionInUrl handles it)
      let session = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!session) {
        setError("Could not confirm your account. Please try logging in.");
        return;
      }

      setStatus("Setting up your payment account…");

      try {
        const res = await fetch("/api/stripe/create-connect-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email ?? "",
          }),
        });

        if (!res.ok) {
          throw new Error("Stripe account creation failed");
        }

        const { url } = await res.json();
        setStatus("Redirecting to bank setup…");
        window.location.href = url;
      } catch {
        // Stripe failed — still let them into the dashboard
        window.location.href = "/dashboard";
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
          <a href="/login" className="text-sm text-violet-600 font-medium hover:underline">
            Go to login
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
