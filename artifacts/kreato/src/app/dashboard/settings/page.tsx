"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/DashboardNav";

export default function SettingsPage() {
  const [handle, setHandle] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: creator } = await supabase
        .from("creators")
        .select("handle, full_name")
        .eq("id", session.user.id)
        .single();

      if (!creator) {
        window.location.href = "/onboarding";
        return;
      }

      setHandle(creator.handle);
      setFullName(creator.full_name);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav handle={handle} creatorName={fullName} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your account and preferences.
          </p>
        </div>

        <div className="card p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-violet-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Coming soon
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Profile editing, payout settings, and notification preferences will
            be available here.
          </p>
        </div>
      </main>
    </div>
  );
}
