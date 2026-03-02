import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SampleSpecsTable, { type SpecItem } from "@/components/SampleSpecsTable";
import DeleteSpecDialog from "@/components/DeleteSpecDialog";
import ViewSpecDialog from "@/components/ViewSpecDialog";

export default function SampleSpecsPage() {
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewSpecName, setViewSpecName] = useState<string | null>(null);
  const [deleteSpecName, setDeleteSpecName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refreshSpecs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sample-specs");
      if (!res.ok) throw new Error("Failed to load specs");
      const data = await res.json();
      setSpecs(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load specs";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSpecs();
  }, []);

  async function handleUpload(files: FileList) {
    const MAX_SPEC_SIZE = 1_048_576; // 1 MB
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_SPEC_SIZE) {
          toast.error(`${file.name}: file too large (max 1 MB)`);
          continue;
        }
        try {
          const content = await file.text();
          const res = await fetch("/api/sample-specs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, content }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({ message: "Upload failed" }));
            throw new Error(body.message);
          }

          toast(`Uploaded ${file.name}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          toast.error(`${file.name}: ${message}`);
        }
      }
      await refreshSpecs();
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files);
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sample Specs</h1>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load specs</p>
          <Button variant="outline" onClick={refreshSpecs}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && specs.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No sample specs uploaded yet. Click Upload to add your first spec.
        </p>
      )}

      {!loading && !error && specs.length > 0 && (
        <SampleSpecsTable
          specs={specs}
          onView={(name) => setViewSpecName(name)}
          onDelete={(name) => setDeleteSpecName(name)}
        />
      )}

      <ViewSpecDialog
        specName={viewSpecName}
        open={viewSpecName !== null}
        onOpenChange={(open) => {
          if (!open) setViewSpecName(null);
        }}
      />

      <DeleteSpecDialog
        specName={deleteSpecName}
        open={deleteSpecName !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteSpecName(null);
        }}
        onDeleted={refreshSpecs}
      />
    </div>
  );
}
