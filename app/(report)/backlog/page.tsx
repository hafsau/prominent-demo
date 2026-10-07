import type { Metadata } from "next";
import { BacklogMatrix } from "@/components/report/backlog-matrix";
import { SectionHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Prioritized backlog", description: "An interactive impact × effort matrix of all 24 findings, the MVP cut, and a Jira-ready CSV export." };

export default function BacklogPage() {
  return (
    <div className="space-y-10">
      <SectionHeader n="07" eyebrow="Prioritized backlog, with the solutions architect" title="Every finding, placed by impact and effort">
        Impact comes from the audit: severity scaled by how many sessions hit the problem. Effort comes from the architect. This board is where the two meet. Move a dot when the estimate changes and the backlog re-sorts, then export it straight into Jira.
      </SectionHeader>
      <BacklogMatrix />
    </div>
  );
}
