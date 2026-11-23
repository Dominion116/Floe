"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

// The wizard pulls in the Sui SDK, so it loads on first open only.
const CreateLinkModal = dynamic(() => import("./CreateLinkModal"), { ssr: false });

interface CreateLinkContextValue {
  openCreateLink: () => void;
  /** Increments after each saved link, so lists can refresh. */
  createdCount: number;
}

const CreateLinkContext = createContext<CreateLinkContextValue | null>(null);

export function useCreateLink(): CreateLinkContextValue {
  const value = useContext(CreateLinkContext);
  if (!value) throw new Error("useCreateLink must be used inside CreateLinkProvider");
  return value;
}

export function CreateLinkProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The modal belongs to the page it was opened on, so Back closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  const openCreateLink = useCallback(() => {
    setHasOpened(true);
    setOpenPath(pathname);
  }, [pathname]);
  const close = useCallback(() => setOpenPath(null), []);
  const handleCreated = useCallback(() => setCreatedCount((n) => n + 1), []);

  useEffect(() => {
    setOpenPath((path) => (path === pathname ? path : null));
  }, [pathname]);

  const value = useMemo(
    () => ({ openCreateLink, createdCount }),
    [openCreateLink, createdCount]
  );

  return (
    <CreateLinkContext.Provider value={value}>
      {children}
      {hasOpened && (
        <CreateLinkModal
          open={openPath !== null && openPath === pathname}
          onClose={close}
          onCreated={handleCreated}
        />
      )}
    </CreateLinkContext.Provider>
  );
}

interface CreateLinkButtonProps {
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
}

/** Opens the wizard in place. Stays a real link to /send for new tabs and no-JS. */
export function CreateLinkButton({ className, children, onOpen }: CreateLinkButtonProps) {
  const { openCreateLink } = useCreateLink();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onOpen?.();
    openCreateLink();
  };

  return (
    <Link href="/send" onClick={handleClick} aria-haspopup="dialog" className={className}>
      {children}
    </Link>
  );
}
