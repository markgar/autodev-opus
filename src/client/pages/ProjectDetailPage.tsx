import { useParams } from "react-router-dom";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold">Project Detail</h1>
      <p className="text-muted-foreground">{id}</p>
    </div>
  );
}
