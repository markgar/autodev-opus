import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SampleSpecsTable from "@/components/SampleSpecsTable";
import DeleteSpecDialog from "@/components/DeleteSpecDialog";
import ViewSpecDialog from "@/components/ViewSpecDialog";
import { useSampleSpecs } from "@/hooks/useSampleSpecs";

export default function SampleSpecsPage() {
  const { specs, loading, error, uploading, refreshSpecs, uploadFiles } = useSampleSpecs();
  const [viewSpecName, setViewSpecName] = useState<string | null>(null);
  const [deleteSpecName, setDeleteSpecName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
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
