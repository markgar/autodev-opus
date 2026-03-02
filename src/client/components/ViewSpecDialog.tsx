import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, RotateCw } from "lucide-react";
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
  const controllerRef = useRef<AbortController | null>(null);

  const fetchSpec = useCallback(
    async (signal?: AbortSignal) => {
      if (!specName) return;
      setLoading(true);
      setError(null);
      setContent("");
      try {
        const res = await fetch(
          `/api/sample-specs/${encodeURIComponent(specName)}`,
          { signal },
        );
        if (!res.ok) throw new Error("Failed to load spec");
        const text = await res.text();
        setContent(text);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load spec");
      } finally {
        setLoading(false);
      }
    },
    [specName],
  );

  useEffect(() => {
    if (!open || !specName) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchSpec(controller.signal);

    return () => controller.abort();
  }, [open, specName, fetchSpec]);

  function handleRetry() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchSpec(controller.signal);
  }

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
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCw />
              Retry
            </Button>
          </div>
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
