import { useState, useMemo, useCallback } from "react";
import { useUsers } from "@/hooks/useUsers";
import { createUserColumns } from "@/components/pages/users/userColumns";
import { exportUsersCsv } from "@/utils/export/exportUsersCsv";
import { toast } from "sonner";

export function useUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error, refetch } = useUsers(page, search, filter);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((val: string) => {
    setFilter(val);
    setPage(1);
  }, []);

  const handleViewUser = useCallback((id: string) => {
    setSelectedUserId(id);
    setIsPanelOpen(true);
  }, []);

  const handleExportCSV = async (currentPageOnly: boolean) => {
    setExporting(true);
    try {
      await exportUsersCsv(currentPageOnly, data);
    } catch (err: any) {
      toast.error(err.message || "Failed to export CSV file");
    } finally {
      setExporting(false);
    }
  };

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedUserId(null);
  }, []);

  const columns = useMemo(
    () => createUserColumns({ handleViewUser }),
    [handleViewUser]
  );

  return {
    page,
    setPage,
    search,
    filter,
    selectedUserId,
    isPanelOpen,
    exporting,
    data,
    isLoading,
    error,
    refetch,
    handleSearchChange,
    handleFilterChange,
    handleExportCSV,
    handleClosePanel,
    columns,
  };
}
