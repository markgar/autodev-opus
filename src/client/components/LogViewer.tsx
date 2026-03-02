import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogViewerProps {
  lines: string[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function LogViewer({ lines, loading, error, onRetry }: LogViewerProps) {
  if (error) {
    return (
      <div className="bg-zinc-900 text-zinc-100 font-mono text-sm rounded-lg border border-zinc-700 p-4">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading && lines.length === 0) {
    return (
      <div className="bg-zinc-900 text-zinc-100 font-mono text-sm rounded-lg border border-zinc-700 p-4">
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading logs...</span>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="bg-zinc-900 text-zinc-100 font-mono text-sm rounded-lg border border-zinc-700 p-4">
        <p className="text-zinc-400 text-center py-8">
          No logs yet — logs will appear here when a build runs.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-zinc-900 text-zinc-100 font-mono text-sm rounded-lg border border-zinc-700 p-4 max-h-[600px] overflow-y-auto">
        {lines.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-all leading-relaxed">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
