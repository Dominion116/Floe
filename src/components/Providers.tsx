"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { CreateLinkProvider } from "@/components/create/CreateLinkProvider";
import { getStoredLinks } from "@/lib/storage";

export function Providers({ children }: { children: React.ReactNode }) {
  // Reading migrates old records, which erases any private key saved by earlier versions.
  useEffect(() => {
    getStoredLinks();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <CreateLinkProvider>{children}</CreateLinkProvider>
    </MotionConfig>
  );
}
