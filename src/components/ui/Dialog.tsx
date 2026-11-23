"use client";

import { useEffect, useRef, type ReactNode, type RefObject, type SyntheticEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drives a native <dialog>. The browser provides the focus trap, the inert page
 * behind it, and focus restoration to the trigger on close.
 */
export function useDialog(
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>
) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      initialFocus?.current?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, initialFocus]);

  return {
    ref,
    onCancel: (e: SyntheticEvent) => {
      e.preventDefault();
      onClose();
    },
    onClose: () => {
      if (open) onClose();
    },
  };
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";
  className?: string;
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  role,
  className,
  initialFocus,
  children,
}: ModalProps) {
  const dialog = useDialog(open, onClose, initialFocus);

  return (
    <dialog
      {...dialog}
      role={role}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn("modal sm:max-w-[480px]", className)}
    >
      {open && children}
    </dialog>
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} className="btn-icon" aria-label="Close dialog">
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
