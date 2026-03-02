import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Name must be 100 characters or less"),
  specName: z.string().min(1, "Please select a sample spec"),
});

export type FormValues = z.infer<typeof formSchema>;

interface SpecOption {
  name: string;
}

export function useNewProjectForm() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState<SpecOption[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(true);
  const [specsError, setSpecsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", specName: "" },
  });

  async function loadSpecs() {
    setLoadingSpecs(true);
    setSpecsError(false);
    try {
      const res = await fetch("/api/sample-specs");
      if (!res.ok) throw new Error("Failed to load specs");
      const data: SpecOption[] = await res.json();
      setSpecs(data);
    } catch {
      setSpecsError(true);
      setSpecs([]);
    } finally {
      setLoadingSpecs(false);
    }
  }

  useEffect(() => {
    loadSpecs();
  }, []);

  const specsEmpty = !loadingSpecs && !specsError && specs.length === 0;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          specName: `${values.specName}.md`,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Failed to create project" }));
        throw new Error(body.message);
      }
      const data = await res.json();
      navigate(`/projects/${data.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return { form, specs, loadingSpecs, specsError, specsEmpty, submitting, loadSpecs, onSubmit };
}
