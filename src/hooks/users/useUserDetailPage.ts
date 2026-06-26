import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useUserDetail, useUserMutations } from "@/hooks/useUsers";
import { getErrorMessage } from "@/lib/errors";

export type UserDetailTab = "activity" | "purchases" | "admin";

export function useUserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, quizHistory, purchases, isLoading, error, refetch } = useUserDetail(
    userId ?? null,
  );
  const { grantAdmin, deleteUser, isGranting, isDeleting } = useUserMutations();

  const [activeTab, setActiveTab] = useState<UserDetailTab>("activity");
  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isAdmin = user?.app_metadata?.role === "admin";

  const handleBack = useCallback(() => {
    navigate("/users");
  }, [navigate]);

  const handleConfirmGrantAdmin = useCallback(async () => {
    if (!userId) return;
    await grantAdmin(userId);
    setIsAdminConfirmOpen(false);
  }, [userId, grantAdmin]);

  const handleConfirmDelete = useCallback(async () => {
    if (!userId) return;
    await deleteUser(userId);
    navigate("/users");
  }, [userId, deleteUser, navigate]);

  const errorMessage = error ? getErrorMessage(error, "Failed to load user details") : null;

  return {
    userId,
    user,
    quizHistory,
    purchases,
    isLoading,
    errorMessage,
    refetch,
    activeTab,
    setActiveTab,
    isAdmin: !!isAdmin,
    isAdminConfirmOpen,
    setIsAdminConfirmOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleBack,
    handleConfirmGrantAdmin,
    handleConfirmDelete,
    isGranting,
    isDeleting,
  };
}
