import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogViewerProps {
  lines: string[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  paused?: boolean;
  onTogglePause?: () => void;
}

const SCROLL_THRESHOLD = 50;
const TERMINAL_BASE = "bg-zinc-900 text-zinc-100 font-mono text-xs md:text-sm rounded-lg border border-zinc-700 p-4 h-full";

export default function LogViewer({ lines, loading, error, onRetry, paused, onTogglePause }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    if (!isAtBottom) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines, isAtBottom]);

  if (error) {
    return (
      <div className={TERMINAL_BASE}>
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
      <div className={TERMINAL_BASE}>
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading logs...</span>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className={TERMINAL_BASE}>
        <p className="text-zinc-400 text-center py-8">
          No logs yet — logs will appear here when a build runs.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {onTogglePause && (
        <button
          onClick={onTogglePause}
          className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-md bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          {paused ? (
            <>
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              <Play className="h-3 w-3" />
              Resume
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <Pause className="h-3 w-3" />
              Pause
            </>
          )}
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`${TERMINAL_BASE} overflow-y-auto`}
      >
        {lines.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-all leading-relaxed">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
