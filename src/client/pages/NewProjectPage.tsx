import { Loader2 } from "lucide-react";
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
import { useNewProjectForm } from "@/hooks/useNewProjectForm";
import { useNavigate } from "react-router-dom";

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { form, specs, loadingSpecs, specsError, specsEmpty, submitting, loadSpecs, onSubmit } = useNewProjectForm();

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
                {specsError ? (
                  <p className="text-sm text-destructive">
                    Failed to load specs.{" "}
                    <button
                      type="button"
                      onClick={loadSpecs}
                      className="underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </p>
                ) : (
                  <>
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
                  </>
                )}
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || specsEmpty || specsError}>
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
