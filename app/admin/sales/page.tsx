import SalesAdmin from "@/components/sales-admin";
export const metadata = {
  title: "Sales Workspace",
  description: "Restricted EazziMe sales workspace.",
  robots: { index: false, follow: false },
};
export default function SalesPage() {
  return <SalesAdmin />;
}
