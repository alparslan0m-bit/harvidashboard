import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { RequireAdmin } from "./RequireAdmin";
import { AppShell } from "../components/layout/AppShell";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Users } from "../pages/Users";
import { Curriculum } from "../pages/Curriculum";
import { Questions } from "../pages/Questions";
import { Import } from "../pages/Import";
import { Purchases } from "../pages/Purchases";
import { Feedback } from "../pages/Feedback";
import { Analytics } from "../pages/Analytics";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<RequireAdmin />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/import" element={<Import />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
