import type { Metadata } from "next";
import { EligibilityCheck } from "@/components/after/eligibility";

export const metadata: Metadata = { title: "After: check coverage", description: "The redesigned eligibility check for the fictional MedLink portal: any date format, errors that keep your work, and a plain answer first." };

export default function Page() {
  return <EligibilityCheck />;
}
