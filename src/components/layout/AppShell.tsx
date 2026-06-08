import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { CommandPalette } from "../shared/CommandPalette";
import { ThemeProvider } from "next-themes";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Responsive Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Main Workspace Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <Topbar
            onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
            onSearchTrigger={() => setCommandPaletteOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 page-enter">
            <div className="mx-auto max-w-[1800px]">
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
    </ThemeProvider>
  );
};

export default AppShell;
