"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  firstName: string;
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Invoices", href: "/dashboard/invoices" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Payouts", href: "/dashboard/payouts" },
];

export default function DashboardNav({ firstName }: Props) {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Kreato</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-violet-700 bg-violet-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{firstName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
