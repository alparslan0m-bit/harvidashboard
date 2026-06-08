import { useState, useMemo, useCallback } from "react";
import { useFeedback, useFeedbackMutations } from "@/hooks/useFeedback";
import { createFeedbackColumns, applyExpansionColumnOverrides } from "@/components/pages/feedback/feedbackColumns";
import { expandFeedbackRows } from "@/utils/feedback/expandFeedbackRows";
import type { FeedbackTab } from "@/components/pages/feedback/FeedbackTabs";

export function useFeedbackPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error, unreadCount, refetch } = useFeedback(page, activeTab);
  const { updateStatus, deleteFeedback } = useFeedbackMutations(page, activeTab);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setExpandedRowId(null);
    setSelectedIds(new Set());
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFeedback(deleteId);
      setDeleteId(null);
      if (expandedRowId === deleteId) {
        setExpandedRowId(null);
      }
    }
  };

  const handleStatusUpdate = useCallback(
    async (id: string, newStatus: string) => {
      await updateStatus({ id, status: newStatus as any });
    },
    [updateStatus]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkArchive = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      updateStatus({ id, status: "archived" })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
  }, [selectedIds, updateStatus]);

  const handleBulkMarkRead = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      updateStatus({ id, status: "read" })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
  }, [selectedIds, updateStatus]);

  const columns = useMemo(
    () =>
      createFeedbackColumns({
        selectedIds,
        expandedRowId,
        toggleSelection,
        handleToggleExpand,
        handleStatusUpdate,
        setDeleteId,
      }),
    [expandedRowId, selectedIds, handleToggleExpand, handleStatusUpdate, toggleSelection]
  );

  const tableDataWithExpansions = useMemo(
    () => expandFeedbackRows(data?.feedbackList || [], expandedRowId),
    [data?.feedbackList, expandedRowId]
  );

  const customColumns = useMemo(
    () => applyExpansionColumnOverrides(columns),
    [columns]
  );

  const tabs: FeedbackTab[] = useMemo(
    () => [
      { id: "all", name: "All Feedback" },
      { id: "new", name: "New", count: unreadCount },
      { id: "read", name: "Read" },
      { id: "resolved", name: "Resolved" },
      { id: "archived", name: "Archived" },
    ],
    [unreadCount]
  );

  return {
    page,
    setPage,
    activeTab,
    deleteId,
    setDeleteId,
    selectedIds,
    data,
    isLoading,
    error,
    refetch,
    handleTabChange,
    handleDelete,
    handleBulkArchive,
    handleBulkMarkRead,
    tabs,
    customColumns,
    tableDataWithExpansions,
  };
}
