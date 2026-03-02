import app from "./app.js";
import { initCosmos } from "./azure/initCosmos.js";

function parsePort(raw: string | undefined): number {
  const port = parseInt(raw ?? "3000", 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: "${raw}" — must be an integer between 1 and 65535`);
  }
  return port;
}

const PORT = parsePort(process.env["PORT"]);

try {
  await initCosmos();
} catch (error) {
  console.warn("Cosmos DB initialization skipped (unavailable):", (error as Error).message);
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

