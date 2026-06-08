import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download } from "lucide-react";

interface UserExportMenuProps {
  exporting: boolean;
  isLoading: boolean;
  hasUsers: boolean;
  onExportCurrentPage: () => void;
  onExportAll: () => void;
}

export const UserExportMenu: React.FC<UserExportMenuProps> = ({
  exporting,
  isLoading,
  hasUsers,
  onExportCurrentPage,
  onExportAll,
}) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        disabled={exporting || isLoading || !hasUsers}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 cursor-pointer"
        aria-label="Export Actions"
      >
        <Download className="h-4 w-4" />
        <span>{exporting ? "Exporting CSV..." : "Export CSV"}</span>
      </button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="z-50 min-w-[150px] rounded-lg border border-border bg-card p-1 shadow-lg focus:outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Item
          onClick={onExportCurrentPage}
          className="relative flex items-center rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
        >
          Export current page
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={onExportAll}
          className="relative flex items-center rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
        >
          Export all users
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
