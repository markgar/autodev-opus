const stampId = process.env["STAMP_ID"] || "qqq";

if (!/^[a-z0-9]{1,16}$/.test(stampId)) {
  throw new Error(
    `Invalid STAMP_ID "${stampId}": must be 1-16 lowercase alphanumeric characters`
  );
}

const storageAccountName = `stautodev${stampId}`;
const cosmosAccountName = `cosmos-autodev-${stampId}`;
const cosmosDatabaseName = "autodev";
const cosmosContainerName = "items";

export { stampId, storageAccountName, cosmosAccountName, cosmosDatabaseName, cosmosContainerName };
