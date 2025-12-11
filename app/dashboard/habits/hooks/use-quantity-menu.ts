"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MENU_DEFAULT_WIDTH,
  MENU_MIN_WIDTH,
  MENU_VIEWPORT_GUTTER,
} from "../constants";
import type { MenuPosition } from "../types";

export const useQuantityMenu = () => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [menuWidth, setMenuWidth] = useState<number>(MENU_DEFAULT_WIDTH);

  const closeMenu = useCallback(() => {
    setOpenId(null);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const viewportLeft = window.scrollX + MENU_VIEWPORT_GUTTER;
    const viewportRight =
      window.scrollX + window.innerWidth - MENU_VIEWPORT_GUTTER;
    const availableWidth = Math.max(
      window.innerWidth - MENU_VIEWPORT_GUTTER * 2,
      0
    );
    const calculatedWidth =
      availableWidth <= 0
        ? MENU_DEFAULT_WIDTH
        : availableWidth < MENU_MIN_WIDTH
        ? availableWidth
        : Math.min(MENU_DEFAULT_WIDTH, availableWidth);
    setMenuWidth(calculatedWidth);

    const rightEdge = rect.right + window.scrollX;
    const preferredLeft = rightEdge - calculatedWidth;
    const maxLeft = Math.max(viewportRight - calculatedWidth, viewportLeft);
    const left = Math.min(Math.max(preferredLeft, viewportLeft), maxLeft);

    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left,
    });
  }, []);

  const registerAnchor = useCallback((node: HTMLDivElement | null) => {
    anchorRef.current = node;
  }, []);

  const registerMenu = useCallback((node: HTMLDivElement | null) => {
    menuRef.current = node;
  }, []);

  const toggleMenu = useCallback(
    (id: string, anchor?: HTMLDivElement | null) => {
      if (openId === id) {
        closeMenu();
        return;
      }
      if (anchor) {
        anchorRef.current = anchor;
      }
      setOpenId(id);
    },
    [closeMenu, openId]
  );

  useEffect(() => {
    if (!openId) {
      anchorRef.current = null;
      menuRef.current = null;
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (anchorRef.current && anchorRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      closeMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu, openId]);

  useEffect(() => {
    if (!openId) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [openId, updateMenuPosition]);

  return {
    anchorRef,
    menuRef,
    openId,
    menuPosition,
    menuWidth,
    toggleMenu,
    closeMenu,
    registerAnchor,
    registerMenu,
  };
};
