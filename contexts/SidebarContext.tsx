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
  const [montado, setMontado] = useState(false);

  // Cargar estado guardado al montar
  useEffect(() => {
    setMontado(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved) {
        try {
          setCollapsed(JSON.parse(saved));
        } catch (error) {
          console.error("Error parsing sidebar state:", error);
        }
      }
    }
  }, []);

  // Guardar estado cuando cambie
  useEffect(() => {
    if (montado && typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, montado]);

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
    // Durante SSR o fuera del provider, retornar valores por defecto
    // en lugar de lanzar error para evitar crashes
    if (typeof window === "undefined") {
      return {
        collapsed: false,
        setCollapsed: () => {},
        toggleCollapsed: () => {},
      };
    }
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
