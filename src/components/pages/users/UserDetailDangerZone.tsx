import React from "react";
import { ShieldAlert, Trash2, Check } from "lucide-react";

interface UserDetailDangerZoneProps {
  isAdmin: boolean;
  onGrantAdmin: () => void;
  onDelete: () => void;
}

export const UserDetailDangerZone: React.FC<UserDetailDangerZoneProps> = ({
  isAdmin,
  onGrantAdmin,
  onDelete,
}) => (
  <div className="space-y-2 border-t border-border/60 pt-6 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500">Danger Zone Operations</h4>
    <div className="flex gap-4">
      {isAdmin ? (
        <button disabled className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground border text-xs font-semibold cursor-not-allowed">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>Already Admin</span>
        </button>
      ) : (
        <button onClick={onGrantAdmin} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-zinc-950 dark:bg-zinc-800 border text-xs font-semibold transition">
          <ShieldAlert className="h-4 w-4" />
          <span>Grant Admin Access</span>
        </button>
      )}
      <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-destructive text-white text-xs font-semibold transition">
        <Trash2 className="h-4 w-4" />
        <span>Permanently Delete</span>
      </button>
    </div>
  </div>
);
