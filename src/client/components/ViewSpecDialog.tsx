import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ViewSpecDialogProps {
  specName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewSpecDialog({
  specName,
  open,
  onOpenChange,
}: ViewSpecDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !specName) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setContent("");

    fetch(`/api/sample-specs/${encodeURIComponent(specName)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load spec");
        return res.text();
      })
      .then((text) => {
        if (!controller.signal.aborted) setContent(text);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load spec");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, specName]);

  function handleDownload() {
    if (!specName || !content) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = specName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{specName}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">{error}</p>
        )}

        {!loading && !error && (
          <pre className="max-h-[70vh] overflow-y-auto font-mono text-sm whitespace-pre-wrap p-4 bg-muted rounded">
            {content}
          </pre>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={loading || !content}
          >
            <Download />
            Download
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
