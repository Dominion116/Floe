"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { CreateLinkProvider } from "@/components/create/CreateLinkProvider";
import { clearObsoleteLinks } from "@/lib/storage";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    clearObsoleteLinks();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <CreateLinkProvider>{children}</CreateLinkProvider>
    </MotionConfig>
  );
}
