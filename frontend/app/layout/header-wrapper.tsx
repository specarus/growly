"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Header from "./header";

const HeaderWrapper: React.FC = () => {
  const pathname = usePathname();

  const isRoot = pathname === "/";

  if (isRoot) {
    return null;
  }

  return <Header />;
};

export default HeaderWrapper;
