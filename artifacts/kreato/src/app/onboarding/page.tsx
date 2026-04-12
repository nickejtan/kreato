import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("id", user.id)
    .single();

  if (creator) {
    redirect("/dashboard");
  }

  const defaultName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Kreato
          </span>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1 rounded-full bg-violet-600" />
            <div className="flex-1 h-1 rounded-full bg-gray-100" />
            <div className="flex-1 h-1 rounded-full bg-gray-100" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Set up your creator profile
          </h1>
          <p className="text-sm text-gray-400 mb-7">
            Just a few details to get you started on Kreato.
          </p>

          <OnboardingForm userId={user.id} defaultName={defaultName} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          This only takes 60 seconds and you can update everything later.
        </p>
      </div>
    </div>
  );
}
