"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import PkIcon from "@/assets/P&K_ICON.png"
import PkLogo from "@/assets/P&K_LOGO.png"
import StagingUpdatesPanel from "@/components/StagingUpdatesPanel"

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    label: "Price Calculators",
    href: "/hub/calculators",
    icon: (
      <>
        <rect width="14" height="18" x="5" y="3" rx="2" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01" />
      </>
    ),
  },
  {
    label: "Data Management",
    href: "/hub/data",
    icon: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
        <path d="M7 4v16" />
      </>
    ),
  },
  {
    label: "PK Tax",
    href: "/hub/pk-tax",
    icon: (
      <>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    label: "Referrals",
    href: "/hub/referrals",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: "Commercial Invoices",
    href: "/hub/commercial-invoices",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
  },
  {
    label: "Quick Reference",
    href: "/hub/reference",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </>
    ),
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function HubSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hub-dashboard-sidebar w-full rounded-[1.6rem] p-3 sm:p-4 md:w-[272px] md:shrink-0 lg:w-[296px] xl:w-[320px]">
      <div className="flex justify-center pt-1 sm:pt-2">
        <Link href="/" aria-label="Pins Hub home">
          <Image
            src={PkLogo}
            alt="Pins & Knuckles"
            priority
            className="h-auto w-[150px] sm:w-[176px] md:w-[190px] xl:w-[220px]"
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "hub-dashboard-nav-item group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition sm:min-h-12 sm:rounded-2xl sm:px-4 md:min-h-[3.25rem] lg:min-h-14",
                active ? "hub-dashboard-nav-item-active" : "",
              ].join(" ")}
            >
              <svg
                className={[
                  "h-[18px] w-[18px] shrink-0 transition sm:h-5 sm:w-5",
                  active ? "text-brand-red" : "text-brand-muted group-hover:text-brand-cream",
                ].join(" ")}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <StagingUpdatesPanel />

      <div className="mt-auto space-y-2.5 border-t border-brand-border pt-4 sm:space-y-3 sm:pt-5">
        <div className="rounded-xl border border-brand-border bg-brand-panel-alt/70 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Image src={PkIcon} alt="" className="h-10 w-10 rounded-full sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-cream sm:text-base">Pins Hub</p>
              <p className="text-xs text-brand-muted sm:text-sm">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
