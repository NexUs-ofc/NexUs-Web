/* eslint-disable react-refresh/only-export-components */
import { createContext } from "react";
import type { ReactNode } from "react";
import { useStoreCollection } from "../../hooks/useStoreCollection";
import type { UseStoreCollectionResult } from "../../hooks/useStoreCollection";

export const StoresContext = createContext<UseStoreCollectionResult | null>(null);

export interface StoresProviderProps { children: ReactNode; }

export default function StoresProvider({ children }: StoresProviderProps) {
    const value = useStoreCollection();
    return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
}
