"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  handle: string;
  creatorName: string;
}

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Products", href: "/dashboard/products/new" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardNav({ handle, creatorName }: Props) {
  const pathname = usePathname();

  const initials = creatorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-0 flex items-stretch h-14">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pr-8 border-r border-gray-100 flex-shrink-0"
        >
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Kreato</span>
        </Link>

        {/* Nav links — center */}
        <nav className="flex items-center gap-0.5 flex-1 px-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* My Store — opens public storefront */}
          <Link
            href={`/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              pathname === `/${handle}`
                ? "bg-violet-50 text-violet-700"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            My Store
            <svg
              className="w-3 h-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 flex-shrink-0">
          {/* Avatar + handle + view store link */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-medium text-gray-700">
                @{handle}
              </span>
              <Link
                href={`/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-500 hover:text-violet-700 transition-colors"
              >
                View store →
              </Link>
            </div>
          </div>

          <div className="w-px h-5 bg-gray-100" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
