import React, { useState } from "react";
import { useUserDetail, useUserMutations } from "@/hooks/useUsers";
import { SlideOver } from "@/components/shared/SlideOver";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserDetailProfile, UserDetailStatsGrid } from "./UserDetailProfile";
import { UserDetailQuizHistory, UserDetailPurchases } from "./UserDetailTables";
import { UserDetailDangerZone } from "./UserDetailDangerZone";

interface UserDetailPanelProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ userId, isOpen, onClose }) => {
  const { user, quizHistory, purchases, isLoading } = useUserDetail(userId);
  const { grantAdmin, deleteUser } = useUserMutations();
  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <>
      <SlideOver isOpen={isOpen} onClose={onClose} title="User Account details" description="Inspect profile stats, performance history, and access control.">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-16 bg-muted rounded-full w-16" />
            <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}</div>
          </div>
        ) : !user ? (
          <p className="text-center py-8 text-xs text-muted-foreground">No profile details available.</p>
        ) : (
          <div className="space-y-6">
            <UserDetailProfile user={user} />
            <UserDetailStatsGrid user={user} />
            <UserDetailQuizHistory quizHistory={quizHistory} />
            <UserDetailPurchases purchases={purchases} />
            <UserDetailDangerZone
              isAdmin={!!isAdmin}
              onGrantAdmin={() => setIsAdminConfirmOpen(true)}
              onDelete={() => setIsDeleteConfirmOpen(true)}
            />
          </div>
        )}
      </SlideOver>

      <ConfirmDialog
        isOpen={isAdminConfirmOpen}
        onClose={() => setIsAdminConfirmOpen(false)}
        onConfirm={async () => { if (userId) await grantAdmin(userId); }}
        title="Elevate account privilege?"
        description="This will grant full admin CRUD capabilities. This action cannot be revoked from the client app."
        confirmText="Confirm Upgrade"
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => { if (userId) { await deleteUser(userId); onClose(); } }}
        title="Permanently delete user account?"
        description="This will delete the authentication record, profile, and all associated data."
        confirmText="Yes, Delete User"
        variant="destructive"
        requireEmailConfirm={user?.email}
      />
    </>
  );
};

export default UserDetailPanel;
