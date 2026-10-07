import type { Metadata } from "next";
import { AuditView } from "@/components/portal/audit-view";
import type { PortalScreen } from "@/components/portal/legacy-portal";

export const metadata: Metadata = {
  title: "The portal, before",
  description: "The fictional MedLink provider portal as it is today, with every audit finding pinned to the live screen.",
};

const SCREENS: PortalScreen[] = ["login", "provider", "home", "eligibility", "claims", "documents"];

export default async function PortalPage({ searchParams }: PageProps<"/portal">) {
  const sp = await searchParams;
  const s = typeof sp.screen === "string" && SCREENS.includes(sp.screen as PortalScreen) ? (sp.screen as PortalScreen) : "login";
  return <AuditView initialScreen={s} embed={sp.embed === "1"} />;
}
