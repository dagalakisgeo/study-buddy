import type { Metadata } from "next";

import { HealthView } from "@/components/health/HealthView";

export const metadata: Metadata = { title: "Κατάσταση" };

export default function HealthPage() {
  return <HealthView />;
}
