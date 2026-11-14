import {
  Code2,
  Layers3,
  Sparkles,
  Cloud,
  Database,
  PenTool,
  Network,
  Workflow,
  Compass,
  ShieldCheck,
  ChartNoAxesCombined,
  Landmark,
  Wallet,
  ShoppingBag,
  Truck,
  Building2,
  Hotel,
  BriefcaseBusiness,
} from "lucide-react";
const icons = {
  code: Code2,
  layers: Layers3,
  sparkles: Sparkles,
  cloud: Cloud,
  database: Database,
  pen: PenTool,
  network: Network,
  workflow: Workflow,
  compass: Compass,
  shield: ShieldCheck,
  chart: ChartNoAxesCombined,
  landmark: Landmark,
  wallet: Wallet,
  shopping: ShoppingBag,
  truck: Truck,
  building: Building2,
  hotel: Hotel,
  briefcase: BriefcaseBusiness,
};
export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const Component = icons[name as keyof typeof icons] || Code2;
  return <Component size={size} strokeWidth={1.6} aria-hidden="true" />;
}
