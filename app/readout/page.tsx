import type { Metadata } from "next";
import { Deck } from "@/components/readout/deck";

export const metadata: Metadata = { title: "Stakeholder readout", description: "The ten-slide findings presentation for the MedLink audit, written for clinical, operations and IT leaders." };

export default function ReadoutPage() {
  return <Deck />;
}
