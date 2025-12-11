"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import type { PortalProps } from "../types";

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const node = document.createElement("div");
    document.body.appendChild(node);
    setContainer(node);

    return () => {
      document.body.removeChild(node);
    };
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export default Portal;
