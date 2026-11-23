"use client";

import { MotionConfig } from "framer-motion";
import { CreateLinkProvider } from "@/components/create/CreateLinkProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CreateLinkProvider>{children}</CreateLinkProvider>
    </MotionConfig>
  );
}
