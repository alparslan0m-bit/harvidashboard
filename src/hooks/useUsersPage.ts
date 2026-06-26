import { useState, useMemo, useCallback } from "react";
import { useUsers } from "@/hooks/useUsers";
import { createUserColumns } from "@/components/pages/users/userColumns";


export function useUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isLoading, error, refetch } = useUsers(page, search, filter);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((val: string) => {
    setFilter(val);
    setPage(1);
  }, []);

  const columns = useMemo(() => createUserColumns(), []);

  return {
    page,
    setPage,
    search,
    filter,
    data,
    isLoading,
    error,
    refetch,
    handleSearchChange,
    handleFilterChange,
    columns,
  };
}
