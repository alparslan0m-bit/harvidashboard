import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { CommandPalette } from "../shared/CommandPalette";
import { ThemeProvider } from "next-themes";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";

const AppShellContent: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen } = useLayout();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isCollapsed, toggle: toggleSidebarCollapse } = useSidebarCollapsed();

  // Global key listener for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Responsive Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <ErrorBoundary fallbackMessage="This page encountered an error">
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Command Palette search */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LayoutProvider>
        <AppShellContent />
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default AppShell;
