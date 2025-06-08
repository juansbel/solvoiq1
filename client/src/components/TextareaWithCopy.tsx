import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TextareaWithCopyProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  className?: string;
}

export function TextareaWithCopy({
  value,
  onChange,
  placeholder,
  rows = 4,
  readOnly = false,
  className
}: TextareaWithCopyProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await copyToClipboard(value);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard."
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
      setError("Failed to copy text.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={className}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={handleCopy}
      >
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
