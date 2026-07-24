import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { RequireAdmin } from "./RequireAdmin";
import { AppShell } from "../components/layout/AppShell";
import { Login } from "../pages/Login";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Users = lazy(() => import("../pages/Users"));
const UserDetail = lazy(() => import("../pages/UserDetail"));
const Curriculum = lazy(() => import("../pages/Curriculum"));
const CurriculumLectureQuestions = lazy(() => import("../pages/CurriculumLectureQuestions"));
const Questions = lazy(() => import("../pages/Questions"));
const Import = lazy(() => import("../pages/Import"));
const Purchases = lazy(() => import("../pages/Purchases"));
const AccessCodes = lazy(() => import("../pages/AccessCodes"));
const Feedback = lazy(() => import("../pages/Feedback"));
const Analytics = lazy(() => import("../pages/Analytics"));

const PageFallback = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<RequireAdmin />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route
              path="/curriculum/lecture/:lectureId"
              element={<CurriculumLectureQuestions />}
            />
            <Route path="/questions" element={<Questions />} />
            <Route path="/import" element={<Import />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/access-codes" element={<AccessCodes />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
