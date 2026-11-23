"use client";

import { useCallback, useEffect, useState } from "react";
import { useCreateLink } from "@/components/create/CreateLinkProvider";
import { syncLinks } from "./chain/sync";
import { getStoredLinks } from "./storage";
import type { PaymentLinkRecord } from "./types";

/** The sender's links, with status read from the chain. */
export function useLinks() {
  const { createdCount } = useCreateLink();
  const [links, setLinks] = useState<PaymentLinkRecord[]>([]);
  const [status, setStatus] = useState<"syncing" | "ready" | "failed">("syncing");

  const refresh = useCallback(async () => {
    setLinks(getStoredLinks());
    setStatus("syncing");
    try {
      setLinks(await syncLinks());
      setStatus("ready");
    } catch {
      setLinks(getStoredLinks());
      setStatus("failed");
    }
  }, []);

  // Runs again when the create modal saves a link on top of the page.
  useEffect(() => {
    void refresh();
  }, [refresh, createdCount]);

  return { links, status, refresh };
}
