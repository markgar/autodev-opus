import { useCallback, useEffect, useRef, useState } from "react";

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export function useProjectDetail(id: string) {
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

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  return {
    project,
    loading,
    error,
    notFound,
    lines,
    logsLoading,
    logsError,
    paused,
    fetchProject,
    fetchLogs,
    togglePause,
  };
}
