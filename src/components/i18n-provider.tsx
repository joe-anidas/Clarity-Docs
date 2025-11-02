"use client";

import { useEffect } from "react";
import "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on mount
    import("@/lib/i18n");
  }, []);

  return <>{children}</>;
}
