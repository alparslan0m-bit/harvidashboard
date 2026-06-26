import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { ConfirmDialog, ErrorView } from "@/components/shared";
import { UserDetailProfile, UserDetailStatsGrid } from "@/components/pages/users/UserDetailProfile";
import { UserDetailQuizHistory, UserDetailPurchases } from "@/components/pages/users/UserDetailTables";
import { UserDetailDangerZone } from "@/components/pages/users/UserDetailDangerZone";
import { UserDetailTabs } from "@/components/pages/users/UserDetailTabs";
import { useUserDetailPage } from "@/hooks/users/useUserDetailPage";

export const UserDetail: React.FC = () => {
  const {
    userId,
    user,
    quizHistory,
    purchases,
    isLoading,
    errorMessage,
    refetch,
    activeTab,
    setActiveTab,
    isAdmin,
    isAdminConfirmOpen,
    setIsAdminConfirmOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleBack,
    handleConfirmGrantAdmin,
    handleConfirmDelete,
    isGranting,
    isDeleting,
  } = useUserDetailPage();

  const tabs = useMemo(
    () => [
      { id: "activity" as const, name: "Quiz Activity", count: quizHistory.length },
      { id: "purchases" as const, name: "Purchases", count: purchases.length },
      { id: "admin" as const, name: "Admin" },
    ],
    [quizHistory.length, purchases.length],
  );

  if (!userId) {
    return (
      <ErrorView
        title="User not found"
        message="No user was selected."
        onRetry={handleBack}
        retryText="Back to Users"
        className="mt-12"
      />
    );
  }

  if (errorMessage) {
    return (
      <ErrorView
        title="Failed to load user details"
        message={errorMessage}
        onRetry={refetch}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent transition focus-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-muted rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[72px] bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      ) : !user ? (
        <ErrorView
          title="User not found"
          message="No profile details are available for this account."
          onRetry={handleBack}
          retryText="Back to Users"
          className="mt-12"
        />
      ) : (
        <>
          <UserDetailProfile user={user} />
          <UserDetailStatsGrid user={user} />

          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <UserDetailTabs activeTab={activeTab} tabs={tabs} onTabChange={setActiveTab} />
            <div className="p-5 sm:p-6">
              {activeTab === "activity" && <UserDetailQuizHistory quizHistory={quizHistory} />}
              {activeTab === "purchases" && <UserDetailPurchases purchases={purchases} />}
              {activeTab === "admin" && (
                <UserDetailDangerZone
                  isAdmin={isAdmin}
                  onGrantAdmin={() => setIsAdminConfirmOpen(true)}
                  onDelete={() => setIsDeleteConfirmOpen(true)}
                  isGranting={isGranting}
                  isDeleting={isDeleting}
                />
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={isAdminConfirmOpen}
        onClose={() => setIsAdminConfirmOpen(false)}
        onConfirm={handleConfirmGrantAdmin}
        title="Elevate account privilege?"
        description="This will grant full admin CRUD capabilities. This action cannot be revoked from the client app."
        confirmText="Confirm Upgrade"
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently delete user account?"
        description="This will delete the authentication record, profile, and all associated data."
        confirmText="Yes, Delete User"
        variant="destructive"
        requireEmailConfirm={user?.email}
      />
    </div>
  );
};

export default UserDetail;
