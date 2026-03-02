import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LogViewer from "@/components/LogViewer";

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [lines, setLines] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const initialLogsFetched = useRef(false);

  const fetchProject = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/projects/${id}`, { signal });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load project");
      }
      const data = await res.json();
      if (!signal?.aborted) setProject(data);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Failed to load project";
      if (!signal?.aborted) setError(message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [id]);

  const fetchLogs = useCallback(async (isInitial: boolean, signal?: AbortSignal) => {
    if (isInitial) {
      setLogsLoading(true);
      setLogsError(null);
    }
    try {
      const res = await fetch(`/api/projects/${id}/logs`, { signal });
      if (!res.ok) {
        throw new Error("Failed to load logs");
      }
      const data = await res.json();
      if (!signal?.aborted) {
        setLines(data.lines);
        setLogsError(null);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Failed to load logs";
      if (!signal?.aborted) setLogsError(message);
    } finally {
      if (isInitial && !signal?.aborted) {
        setLogsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    initialLogsFetched.current = false;
    setProject(null);
    setLines([]);
    setLogsError(null);
    setLogsLoading(true);
    setPaused(false);

    const controller = new AbortController();
    fetchProject(controller.signal);
    return () => controller.abort();
  }, [id, fetchProject]);

  useEffect(() => {
    if (!project) return;

    const controller = new AbortController();

    if (!initialLogsFetched.current) {
      initialLogsFetched.current = true;
      fetchLogs(true, controller.signal);
    }

    if (paused) return () => controller.abort();

    const intervalId = setInterval(() => {
      fetchLogs(false, controller.signal);
    }, POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [project, paused, fetchLogs]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (error || notFound) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {notFound ? "Project not found" : error}
        </p>
        {!notFound && (
          <Button variant="outline" onClick={() => fetchProject()}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">{project.name}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Created {new Date(project.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)]">
        <LogViewer
          lines={lines}
          loading={logsLoading}
          error={logsError}
          onRetry={() => fetchLogs(true)}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
        />
      </div>
    </div>
  );
}
