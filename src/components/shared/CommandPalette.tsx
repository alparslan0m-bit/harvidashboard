import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { buildCommands, buildRecentCommands } from "./CommandPalette/commandPaletteConfig";
import { useCommandPaletteRecents } from "./CommandPalette/useCommandPaletteRecents";
import { CommandPaletteDialog } from "./CommandPalette/CommandPaletteDialog";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const recents = useCommandPaletteRecents();

  const filteredItems = useMemo(() => {
    const all = [
      ...buildCommands(navigate, onClose),
      ...buildRecentCommands(recents, navigate, onClose),
    ];
    return all.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [navigate, onClose, recents, search]);

  return (
    <CommandPaletteDialog
      isOpen={isOpen}
      onClose={onClose}
      search={search}
      onSearchChange={setSearch}
      filteredItems={filteredItems}
    />
  );
};

export default CommandPalette;
