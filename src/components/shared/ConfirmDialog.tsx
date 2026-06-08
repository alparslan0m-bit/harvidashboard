import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "../../lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary";
  requireEmailConfirm?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  requireEmailConfirm,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setEmailInput("");
      onClose();
    } catch {
      // Handled by callers via toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmailInput("");
    onClose();
  };

  const isButtonDisabled =
    isSubmitting ||
    (requireEmailConfirm !== undefined && emailInput !== requireEmailConfirm);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl focus:outline-none transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialog.Title className="text-lg font-bold text-foreground leading-6 font-heading">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialog.Description>

          {requireEmailConfirm && (
            <div className="mt-4 space-y-2">
              <label className="text-sm text-muted-foreground">
                Please type <span className="font-semibold text-foreground select-all">{requireEmailConfirm}</span> to confirm:
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                placeholder="Type email address"
                aria-label="Confirm Email Address"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialog.Cancel
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition focus-ring"
            >
              {cancelText}
            </AlertDialog.Cancel>

            <button
              onClick={handleConfirm}
              disabled={isButtonDisabled}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white transition focus-ring disabled:opacity-50",
                variant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isSubmitting ? "Processing..." : confirmText}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
export default ConfirmDialog;
