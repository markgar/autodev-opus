const stampId = process.env["STAMP_ID"] || "qqq";

if (!/^[a-z0-9]+$/.test(stampId)) {
  throw new Error(
    `Invalid STAMP_ID "${stampId}": must be lowercase alphanumeric only`
  );
}

const storageAccountName = `stautodev${stampId}`;
const cosmosAccountName = `cosmos-autodev-${stampId}`;

export { stampId, storageAccountName, cosmosAccountName };
