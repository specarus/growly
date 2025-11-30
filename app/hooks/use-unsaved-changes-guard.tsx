"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import UnsavedChangesDialog from "@/app/components/ui/unsaved-changes-dialog";

type PendingNavigation = {
  href: string;
};

type UnsavedChangesGuardOptions = {
  isDirty: boolean;
  onSave?: (target: string) => Promise<boolean>;
  onDiscard?: (target: string) => Promise<void> | void;
};

const buildRelativeHref = (
  candidate: string | null,
  compareLocation?: string | null
): string | null => {
  if (typeof window === "undefined" || !candidate) {
    return null;
  }

  if (candidate.startsWith("mailto:") || candidate.startsWith("tel:")) {
    return null;
  }

  if (candidate === "#") {
    return null;
  }

  try {
    const url = new URL(candidate, window.location.href);
    if (url.origin !== window.location.origin) {
      return null;
    }
    const relative = `${url.pathname}${url.search}${url.hash}`;
    const currentLocation =
      compareLocation ??
      `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (relative === currentLocation) {
      return null;
    }
    return relative || "/";
  } catch {
    return null;
  }
};

export const useUnsavedChangesGuard = ({
  isDirty,
  onSave,
  onDiscard,
}: UnsavedChangesGuardOptions) => {
  const router = useRouter();
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pendingNavigationRef = useRef<PendingNavigation | null>(null);
  const lastKnownLocationRef = useRef<string>("");

  useEffect(() => {
    pendingNavigationRef.current = pendingNavigation;
  }, [pendingNavigation]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    lastKnownLocationRef.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  });

  useEffect(() => {
    if (!isDirty) {
      setPendingNavigation(null);
    }
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || typeof window === "undefined") {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || typeof window === "undefined") {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }
      if (pendingNavigationRef.current) {
        return;
      }

      const target = event.target as Element | null;
      if (!target) {
        return;
      }
      if (target.closest("[data-unsaved-dialog]")) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor) {
        return;
      }
      if (anchor.target && anchor.target !== "_self") {
        return;
      }
      if (anchor.hasAttribute("download")) {
        return;
      }

      const relativeHref = buildRelativeHref(anchor.getAttribute("href"));
      if (!relativeHref) {
        return;
      }

      event.preventDefault();
      setPendingNavigation({ href: relativeHref });
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || typeof window === "undefined") {
      return;
    }

    const listenerOptions: AddEventListenerOptions = { capture: true };

    const handlePopState = () => {
      if (pendingNavigationRef.current) {
        return;
      }
      const relativeHref = buildRelativeHref(
        window.location.href,
        lastKnownLocationRef.current
      );
      if (!relativeHref) {
        return;
      }
      if (lastKnownLocationRef.current) {
        window.history.pushState(null, "", lastKnownLocationRef.current);
      }
      setPendingNavigation({ href: relativeHref });
    };

    window.addEventListener("popstate", handlePopState, listenerOptions);
    return () => {
      window.removeEventListener("popstate", handlePopState, listenerOptions);
    };
  }, [isDirty]);

  const handleKeepEditing = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  const handleDiscard = useCallback(async () => {
    if (!pendingNavigation) {
      return;
    }
    const target = pendingNavigation.href;
    await onDiscard?.(target);
    await router.push(target);
    lastKnownLocationRef.current = target;
    setPendingNavigation(null);
  }, [onDiscard, pendingNavigation, router]);

  const handleSave = useCallback(async () => {
    if (!pendingNavigation || !onSave) {
      return;
    }
    setIsSaving(true);
    const target = pendingNavigation.href;
    try {
      const saved = await onSave(target);
      if (!saved) {
        return;
      }
      await router.push(target);
      lastKnownLocationRef.current = target;
      setPendingNavigation(null);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, pendingNavigation, router]);

  const guardDialog = pendingNavigation ? (
    <UnsavedChangesDialog
      open
      targetLabel={pendingNavigation.href}
      isSaving={isSaving}
      onKeepEditing={handleKeepEditing}
      onDiscard={handleDiscard}
      onSave={handleSave}
    />
  ) : null;

  return {
    guardDialog,
  };
};
