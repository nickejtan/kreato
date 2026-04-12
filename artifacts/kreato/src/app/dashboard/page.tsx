import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const STAT_CARDS = [
  { label: "Total Revenue", value: "$0.00", sub: "No payouts yet" },
  { label: "Active Members", value: "0", sub: "Start growing" },
  { label: "Products", value: "0", sub: "Create your first" },
  { label: "Payouts", value: "0", sub: "Pending: $0.00" },
];

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[dashboard] user:", user?.id ?? "null");
  console.log("[dashboard] authError:", authError?.message ?? "none");

  if (!user) {
    redirect("/login");
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("full_name, handle, country, product_type")
    .eq("id", user.id)
    .single();

  if (!creator) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Kreato
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">
              @{creator.handle}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {creator.full_name}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {creator.product_type} · {creator.country}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((stat) => (
            <div key={stat.label} className="card p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="card p-12 flex flex-col items-center justify-center text-center mt-6">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7 text-violet-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Ready to earn
          </h2>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Your creator page is set up. Start building your first product to
            see revenue here.
          </p>
          <button className="btn-primary mt-6 text-sm">
            Create your first product
          </button>
        </div>
      </main>
    </div>
  );
}
