import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Name must be 100 characters or less"),
  specName: z.string().min(1, "Please select a sample spec"),
});

type FormValues = z.infer<typeof formSchema>;

interface SpecOption {
  name: string;
}

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState<SpecOption[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", specName: "" },
  });

  useEffect(() => {
    async function loadSpecs() {
      try {
        const res = await fetch("/api/sample-specs");
        if (!res.ok) throw new Error("Failed to load specs");
        const data: SpecOption[] = await res.json();
        setSpecs(data);
      } catch {
        setSpecs([]);
      } finally {
        setLoadingSpecs(false);
      }
    }
    loadSpecs();
  }, []);

  const specsEmpty = !loadingSpecs && specs.length === 0;

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

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">New Project</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My awesome app"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Spec</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingSpecs || specsEmpty}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingSpecs
                            ? "Loading specs..."
                            : specsEmpty
                              ? "No specs available — upload specs in Admin first"
                              : "Select a sample spec"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specs.map((spec) => {
                      const displayName = spec.name.replace(/\.md$/, "");
                      return (
                        <SelectItem key={spec.name} value={displayName}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || specsEmpty}>
              {submitting && <Loader2 className="animate-spin" />}
              Create Project
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
