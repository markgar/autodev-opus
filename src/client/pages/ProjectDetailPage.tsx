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

  const [lines, setLines] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const initialLogsFetched = useRef(false);

  async function fetchProject() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.status === 404) {
        setError("Project not found");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load project");
      }
      const data = await res.json();
      setProject(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load project";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const fetchLogs = useCallback(async (isInitial: boolean) => {
    if (isInitial) {
      setLogsLoading(true);
    }
    setLogsError(null);
    try {
      const res = await fetch(`/api/projects/${id}/logs`);
      if (!res.ok) {
        throw new Error("Failed to load logs");
      }
      const data = await res.json();
      setLines(data.lines);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load logs";
      setLogsError(message);
    } finally {
      if (isInitial) {
        setLogsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!project) return;

    if (!initialLogsFetched.current) {
      initialLogsFetched.current = true;
      fetchLogs(true);
    }

    if (paused) return;

    const intervalId = setInterval(() => {
      fetchLogs(false);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        {error !== "Project not found" && (
          <Button variant="outline" onClick={fetchProject}>
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
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          Created {new Date(project.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <LogViewer
        lines={lines}
        loading={logsLoading}
        error={logsError}
        onRetry={() => fetchLogs(true)}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
      />
    </div>
  );
}
