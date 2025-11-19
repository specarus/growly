"use client";

import { useContext, useEffect, useCallback } from "react";
import { AuthModal } from "./components/auth/auth-modal";
import { ModalContext } from "./context/ModalContext";

export default function LandingPage() {
  const context = useContext(ModalContext);
  if (!context) return null;

  const { showModal, setShowModal } = context;

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        setShowModal(false);
      }
    },
    [setShowModal]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        event.stopPropagation();

        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, setShowModal]);

  return (
    <main className="w-full min-h-screen relative">
      {showModal && (
        <div
          onClick={handleOverlayClick}
          className="w-full h-screen absolute top-0 left-0 grid place-items-center z-50 bg-black/20"
        >
          <AuthModal />
        </div>
      )}
    </main>
  );
}
