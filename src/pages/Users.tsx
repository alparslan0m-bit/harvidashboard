import React from "react";
import { UserFilters } from "@/components/pages/users/UserFilters";
import { DataTable } from "@/components/shared/DataTable";
import { UserDetailPanel } from "@/components/pages/users/UserDetailPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorView } from "@/components/shared/ErrorView";
import { UserExportMenu } from "@/components/pages/users/UserExportMenu";
import { useUsersPage } from "@/hooks/useUsersPage";
import { PAGE_SIZE } from "@/lib/constants";

export const Users: React.FC = () => {
  const {
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
    <div className="space-y-4">
      <PageHeader
        title="User Accounts"
        description="Configure student permissions, details, and access control."
        actions={
          <UserExportMenu
            exporting={exporting}
            isLoading={isLoading}
            hasUsers={!!data?.users?.length}
            onExportCurrentPage={() => handleExportCSV(true)}
            onExportAll={() => handleExportCSV(false)}
          />
        }
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

      <UserDetailPanel userId={selectedUserId} isOpen={isPanelOpen} onClose={handleClosePanel} />
    </div>
  );
};

export default Users;
