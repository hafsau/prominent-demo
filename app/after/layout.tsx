import { Suspense, type ReactNode } from "react";
import { AfterShell } from "@/components/after/after-shell";

export default function AfterLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AfterShell>{children}</AfterShell>
    </Suspense>
  );
}
