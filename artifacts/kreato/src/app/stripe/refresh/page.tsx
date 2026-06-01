"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StripeRefreshContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setError("Missing account ID. Please go back and try again.");
      return;
    }

    async function refreshLink() {
      const res = await fetch("/api/stripe/onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!res.ok) {
        setError("Could not refresh the onboarding link. Please try again.");
        return;
      }

      const { url } = await res.json();
      window.location.href = url;
    }

    refreshLink();
  }, [accountId]);

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
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Refreshing your onboarding link…</p>
      </div>
    </div>
  );
}

export default function StripeRefreshPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StripeRefreshContent />
    </Suspense>
  );
}
