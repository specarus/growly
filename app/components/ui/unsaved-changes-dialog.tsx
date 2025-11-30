"use client";

import type React from "react";

type UnsavedChangesDialogProps = {
  open: boolean;
  targetLabel?: string;
  isSaving?: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-primary/40";

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  targetLabel,
  isSaving,
  onKeepEditing,
  onDiscard,
  onSave,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center xl:p-3 2xl:p-4"
      data-unsaved-dialog
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="pointer-events-auto relative z-10 max-w-lg rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-2xl">
        <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Unsaved changes
        </p>
        <h3 className="xl:mt-3 2xl:mt-4 xl:text-base 2xl:text-lg font-semibold text-foreground">
          Looks like you started something.
        </h3>

        <p className="mt-1 xl:text-xs 2xl:text-sm text-muted-foreground">
          Save your work before you go or discard the changes to continue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 xl:text-[11px] 2xl:text-xs">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`${buttonClass} bg-primary text-white hover:brightness-110 disabled:opacity-60`}
          >
            {isSaving ? "Saving..." : "Save and continue"}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className={`${buttonClass} border border-destructive/40 text-destructive hover:border-destructive disabled:opacity-60`}
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={isSaving}
            className={`${buttonClass} border border-gray-200 text-foreground hover:border-primary/60 disabled:opacity-60`}
          >
            Keep editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
