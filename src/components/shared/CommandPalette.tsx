import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Compass, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "Recent";
  shortcut?: string;
  action: () => void;
  icon: React.ComponentType<any>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("harvi-recent-pages");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track page visits
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const titleMap: Record<string, string> = {
        "/": "Dashboard Overview",
        "/analytics": "System Analytics",
        "/curriculum": "Curriculum Management",
        "/questions": "Question Bank",
        "/import": "CSV Question Importer",
        "/purchases": "Transaction Ledger",
        "/users": "User Accounts",
        "/feedback": "Student Feedback Logs",
      };
      const name = titleMap[path];
      if (name) {
        setRecents((prev) => {
          const filtered = prev.filter((item) => item !== name);
          const next = [name, ...filtered].slice(0, 5);
          localStorage.setItem("harvi-recent-pages", JSON.stringify(next));
          return next;
        });
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "go-dashboard",
      title: "Go to Dashboard",
      category: "Navigation",
      action: () => {
        navigate("/");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-analytics",
      title: "Go to Analytics",
      category: "Navigation",
      action: () => {
        navigate("/analytics");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-curriculum",
      title: "Go to Curriculum",
      category: "Navigation",
      action: () => {
        navigate("/curriculum");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-questions",
      title: "Go to Questions",
      category: "Navigation",
      action: () => {
        navigate("/questions");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-import",
      title: "Go to CSV Import",
      category: "Navigation",
      action: () => {
        navigate("/import");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-purchases",
      title: "Go to Purchases",
      category: "Navigation",
      action: () => {
        navigate("/purchases");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-users",
      title: "Go to Users",
      category: "Navigation",
      action: () => {
        navigate("/users");
        onClose();
      },
      icon: Compass,
    },
    {
      id: "go-feedback",
      title: "Go to Feedback",
      category: "Navigation",
      action: () => {
        navigate("/feedback");
        onClose();
      },
      icon: Compass,
    },
    // Actions
    {
      id: "action-add-question",
      title: "Add Question",
      category: "Actions",
      action: () => {
        navigate("/questions?action=new");
        onClose();
      },
      icon: Play,
    },
    {
      id: "action-upload-csv",
      title: "Upload CSV",
      category: "Actions",
      action: () => {
        navigate("/import");
        onClose();
      },
      icon: Play,
    },
    {
      id: "action-view-purchases",
      title: "View Purchases",
      category: "Actions",
      action: () => {
        navigate("/purchases");
        onClose();
      },
      icon: Play,
    },
  ];

  // Map Recents dynamically to command objects
  const recentCommands: CommandItem[] = recents.map((recentName, index) => {
    const titleMapToPath: Record<string, string> = {
      "Dashboard Overview": "/",
      "System Analytics": "/analytics",
      "Curriculum Management": "/curriculum",
      "Question Bank": "/questions",
      "CSV Question Importer": "/import",
      "Transaction Ledger": "/purchases",
      "User Accounts": "/users",
      "Student Feedback Logs": "/feedback",
    };
    const path = titleMapToPath[recentName] || "/";
    return {
      id: `recent-${index}`,
      title: `Recent: ${recentName}`,
      category: "Recent",
      action: () => {
        navigate(path);
        onClose();
      },
      icon: RotateCcw,
    };
  });

  const allItems = [...commands, ...recentCommands];

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["Navigation", "Actions", "Recent"] as const;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/3 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden focus:outline-none transition-all select-none">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions or pages... (Type 'Go to')"
              className="w-full bg-transparent text-xs text-foreground placeholder-muted-foreground outline-none"
              autoFocus
              aria-label="Command search"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No commands matching your query.
              </div>
            ) : (
              categories.map((category) => {
                const categoryItems = filteredItems.filter(
                  (item) => item.category === category
                );
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <h4 className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                          {item.shortcut && (
                            <kbd className="font-mono text-[10px] text-muted-foreground group-hover:text-accent-foreground">
                              {item.shortcut}
                            </kbd>
                          )}
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
};

export default CommandPalette;
