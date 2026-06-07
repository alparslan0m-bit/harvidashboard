import React from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { useWindowSize } from "@/hooks/useWindowSize";

export const AppShell: React.FC = () => {
  const { width } = useWindowSize();

  if (width !== undefined && width < 1024) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-xl font-bold tracking-tight mb-2">Desktop Browser Required</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Please use a desktop browser to access the Harvi Admin Dashboard. Minimum supported width is 1024px.
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Workspace Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary fallbackMessage="This page encountered an error">
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
