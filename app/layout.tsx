import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Public_Sans, Urbanist } from "next/font/google";
import "./globals.css";

// Prominent's brand face is Urbane (Adobe Fonts, licensed). Urbanist is its closest open cousin.
const urbanist = Urbanist({ variable: "--font-urbanist", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
// The proposed MedLink pattern library uses Public Sans, the U.S. Web Design System's typeface: familiar ground for a government contractor.
const publicSans = Public_Sans({ variable: "--font-public", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "MedLink portal audit: a Prominent engagement, delivered early", template: "%s · MedLink portal audit" },
  description:
    "A complete UX/UI audit of a fictional healthcare provider portal, by Hafsa Usmani for Prominent's UX/UI Designer (Healthcare Portal Audit) role: heuristic findings pinned to a live portal, task walkthroughs, IA, forms, Section 508/WCAG 2.1, a prioritized backlog, roadmap and stakeholder readout.",
  metadataBase: new URL("https://prominent-demos.vercel.app"),
};

export const viewport: Viewport = { themeColor: "#013e50", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${urbanist.variable} ${publicSans.variable} antialiased`}>
      <body className="font-sans text-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
