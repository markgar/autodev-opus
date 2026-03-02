import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SpecItem {
  name: string;
  size: number;
  lastModified: string;
}

interface SampleSpecsTableProps {
  specs: SpecItem[];
  onView: (name: string) => void;
  onDelete: (name: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SampleSpecsTable({
  specs,
  onView,
  onDelete,
}: SampleSpecsTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec) => (
              <TableRow key={spec.name}>
                <TableCell className="font-medium">{spec.name}</TableCell>
                <TableCell>{formatFileSize(spec.size)}</TableCell>
                <TableCell>
                  {new Date(spec.lastModified).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(spec.name)}
                      aria-label={`View ${spec.name}`}
                    >
                      <Eye />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(spec.name)}
                      aria-label={`Delete ${spec.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {specs.map((spec) => (
          <div
            key={spec.name}
            className="rounded-md border p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-bold">{spec.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(spec.size)} ·{" "}
                {new Date(spec.lastModified).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(spec.name)}
                aria-label={`View ${spec.name}`}
              >
                <Eye />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(spec.name)}
                aria-label={`Delete ${spec.name}`}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export { formatFileSize };
export type { SpecItem };
