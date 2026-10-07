import type { Metadata } from "next";
import { FindingsLog } from "@/components/report/findings-log";
import { SectionHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Heuristic findings", description: "24 findings from a heuristic evaluation of the fictional MedLink provider portal, each with severity, heuristic, WCAG criteria, evidence and a recommendation." };

export default function FindingsPage() {
  return (
    <div className="space-y-10">
      <SectionHeader n="01" eyebrow="Heuristic evaluation" title="Twenty-four findings, worst first">
        Three independent passes against Nielsen&apos;s ten heuristics, covering navigation, clarity, error handling, consistency and user control. Each finding links to where it lives in the portal.
      </SectionHeader>
      <FindingsLog />
    </div>
  );
}
