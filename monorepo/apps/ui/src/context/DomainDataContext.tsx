import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { db, refreshConsoleViewModels, InMemoryAllChecksOutDatabase } from "@/data/console";

type DomainDataContextValue = {
  db: InMemoryAllChecksOutDatabase;
  refresh: () => void;
  version: number;
};

const DomainDataContext = createContext<DomainDataContextValue | null>(null);

export function useDomainData() {
  const value = useContext(DomainDataContext);
  if (!value) throw new Error("useDomainData must be used within <DomainDataProvider>");
  return value;
}

export default function DomainDataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    refreshConsoleViewModels();
    setVersion((current) => current + 1);
  }, []);
  const value = useMemo(
    () => ({
      db,
      refresh,
      version,
    }),
    [refresh, version],
  );

  return (
    <DomainDataContext.Provider value={value}>
      {children}
    </DomainDataContext.Provider>
  );
}
