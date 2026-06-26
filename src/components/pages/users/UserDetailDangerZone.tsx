import React from "react";
import { ShieldAlert, Trash2, Check } from "lucide-react";

interface UserDetailDangerZoneProps {
  isAdmin: boolean;
  onGrantAdmin: () => void;
  onDelete: () => void;
  isGranting?: boolean;
  isDeleting?: boolean;
}

export const UserDetailDangerZone: React.FC<UserDetailDangerZoneProps> = ({
  isAdmin,
  onGrantAdmin,
  onDelete,
  isGranting = false,
  isDeleting = false,
}) => (
  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4 select-none">
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-destructive">
        Admin & Danger Zone
      </h4>
      <p className="mt-1 text-sm text-muted-foreground">
        Privileged actions that affect account access and data. Proceed with caution.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      {isAdmin ? (
        <button
          type="button"
          disabled
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-muted-foreground border border-border text-sm font-semibold cursor-not-allowed"
        >
          <Check className="h-4 w-4 text-emerald-500" />
          <span>Already Admin</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onGrantAdmin}
          disabled={isGranting || isDeleting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background border text-sm font-semibold transition hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>{isGranting ? "Granting…" : "Grant Admin Access"}</span>
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={isGranting || isDeleting}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold transition hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" />
        <span>{isDeleting ? "Deleting…" : "Permanently Delete"}</span>
      </button>
    </div>
  </div>
);
