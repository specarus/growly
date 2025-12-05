"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const buildLocationKey = (pathname: string | null, search: string | null) => {
  const path = pathname ?? "";
  const query = search ? `?${search}` : "";
  return `${path}${query}`;
};

const NavigationLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const locationKey = useMemo(
    () => buildLocationKey(pathname, searchParams?.toString() ?? null),
    [pathname, searchParams]
  );

  useEffect(() => {
    setIsNavigating(false);
  }, [locationKey]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // only left clicks
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const nextLocation = `${url.pathname}${url.search}${url.hash}`;
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextLocation === currentLocation) return;

      setIsNavigating(true);
    };

    window.addEventListener("click", handleLinkClick, true);
    return () => {
      window.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setIsNavigating(true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="loading-screen fixed inset-0 z-9999" role="status">
      <div className="loading-card">
        <span className="loader" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default NavigationLoader;
