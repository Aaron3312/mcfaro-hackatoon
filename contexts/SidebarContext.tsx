"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Cargar estado guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Guardar estado cuando cambie
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
