import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LogViewer from "@/components/LogViewer";
import { useProjectDetail } from "@/hooks/useProjectDetail";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    project, loading, error, notFound,
    lines, logsLoading, logsError, paused,
    fetchProject, fetchLogs, togglePause,
  } = useProjectDetail(id!);

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
          onTogglePause={togglePause}
        />
      </div>
    </div>
  );
}
