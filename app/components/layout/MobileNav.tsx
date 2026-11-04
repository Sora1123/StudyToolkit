"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "./nav";
import { useT } from "@/app/components/i18n/I18nProvider";

export default function MobileNav() {
  const pathname = usePathname();
  const t = useT();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {mobileNavItems.map(({ href, label, labelKey, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            title={t(labelKey)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {/* Label: hidden on very narrow screens (icon-only), shown once
                there's room. Truncates so 6 items never overflow the bar. */}
            <span className="hidden max-w-full truncate text-[10px] leading-none xs:block">
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
