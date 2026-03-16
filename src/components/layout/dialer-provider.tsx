"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface DialerContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
}

const DialerContext = createContext<DialerContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useDialer() {
  return useContext(DialerContext);
}

export function DialerProvider({ children }: { readonly children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DialerContext.Provider value={{ isOpen, open, close }}>
      {children}
    </DialerContext.Provider>
  );
}
