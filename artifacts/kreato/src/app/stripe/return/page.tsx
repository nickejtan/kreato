"use client";

import { useEffect } from "react";

export default function StripeReturnPage() {
  useEffect(() => {
    window.location.href = "/dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Taking you to your dashboard…</p>
      </div>
    </div>
  );
}
