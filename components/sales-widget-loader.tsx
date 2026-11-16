"use client";
import dynamic from "next/dynamic";
const SalesChat = dynamic(() => import("./sales-chat"), { ssr: false });
export function SalesWidgetLoader() {
  return <SalesChat />;
}
