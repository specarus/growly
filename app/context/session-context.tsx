"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Session = typeof import("@/lib/auth").auth.$Infer.Session;

interface SessionContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  initialSession,
}) => {
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const value = useMemo(
    () => ({
      session,
      setSession,
    }),
    [session]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
};
