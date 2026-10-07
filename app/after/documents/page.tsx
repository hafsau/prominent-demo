import type { Metadata } from "next";
import { RecordsRequests } from "@/components/after/documents";

export const metadata: Metadata = { title: "After: records requests", description: "The redesigned records-request flow for the fictional MedLink portal: open requests with due dates, multiple files, and a real confirmation." };

export default function Page() {
  return <RecordsRequests />;
}
