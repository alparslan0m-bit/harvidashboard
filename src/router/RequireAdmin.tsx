import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAdminAuth } from "../hooks/useAdminAuth";

export const RequireAdmin: React.FC = () => {
  const { currentUser, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
