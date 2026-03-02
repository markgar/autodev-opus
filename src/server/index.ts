import app from "./app.js";
import { initCosmos } from "./azure/initCosmos.js";
import { initBlobContainers } from "./azure/initBlob.js";
import { setBlobAvailable } from "./services/sampleSpecs.js";
import { setCosmosAvailable } from "./services/projectsService.js";

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
  setCosmosAvailable(false);
  console.warn("⚠️  Cosmos DB initialization failed:", (error as Error).message);
  console.warn("⚠️  Projects will use in-memory storage (data will not persist across restarts).");
}

try {
  await initBlobContainers();
} catch (error) {
  setBlobAvailable(false);
  console.warn("⚠️  Blob container initialization failed:", (error as Error).message);
  console.warn("⚠️  Sample specs will use in-memory storage (data will not persist across restarts).");
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

