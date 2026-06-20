import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import type { CommandItem } from "./commandPaletteConfig";
import { COMMAND_CATEGORIES } from "./commandPaletteConfig";

interface CommandPaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  filteredItems: CommandItem[];
}

export const CommandPaletteDialog: React.FC<CommandPaletteDialogProps> = ({
  isOpen,
  onClose,
  search,
  onSearchChange,
  filteredItems,
}) => (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity" />
      <Dialog.Content className="fixed left-1/2 top-1/3 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden focus:outline-none transition-all select-none">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search actions or pages..."
            className="w-full bg-transparent text-xs text-foreground placeholder-muted-foreground outline-none"
            autoFocus
            aria-label="Command search"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">No commands matching your query.</div>
          ) : (
            COMMAND_CATEGORIES.map((category) => {
              const categoryItems = filteredItems.filter((item) => item.category === category);
              if (!categoryItems.length) return null;
              return (
                <div key={category} className="space-y-1">
                  <h4 className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h4>
                  <div className="space-y-0.5">
                    {categoryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent-foreground shrink-0" />
                          <span>{item.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
