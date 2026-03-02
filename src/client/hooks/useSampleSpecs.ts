import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SpecItem } from "@/components/SampleSpecsTable";

const MAX_SPEC_SIZE = 1_048_576; // 1 MB

export function useSampleSpecs() {
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  async function uploadFiles(files: FileList) {
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

  useEffect(() => {
    refreshSpecs();
  }, []);

  return { specs, loading, error, uploading, refreshSpecs, uploadFiles };
}
