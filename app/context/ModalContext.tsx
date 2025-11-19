"use client";

import { createContext, useState, ReactNode } from "react";

interface ModalContextType {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [showModal, setShowModal] = useState(false);

  const contextValue: ModalContextType = {
    showModal,
    setShowModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};
