import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200",
        className
      )}
      title="Copy to clipboard"
      aria-label="Copy code or email"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

export default CopyButton;
