import React from "react";
import { UserFilters } from "@/components/pages/users/UserFilters";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorView } from "@/components/shared/ErrorView";

import { useUsersPage } from "@/hooks/useUsersPage";
import { PAGE_SIZE } from "@/lib/constants";

export const Users: React.FC = () => {
  const {
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
  } = useUsersPage();

  if (error) {
    return (
      <ErrorView
        title="Failed to load User Accounts"
        message={error.message}
        onRetry={refetch}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts"
      />

      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={data?.users || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
        totalCount={data?.totalCount || 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
};

export default Users;
