"use client";
import { usePathname } from "next/navigation";
import { Header, Footer } from "./layout";
import { SalesWidgetLoader } from "./sales-widget-loader";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith("/admin/");
  return <>
    {!admin && <Header />}
    <main id="main">{children}</main>
    {!admin && <><Footer /><SalesWidgetLoader /></>}
  </>;
}
