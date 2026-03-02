const stampId = process.env["STAMP_ID"] || "qqq";
const storageAccountName = `stautodev${stampId}`;
const cosmosAccountName = `cosmos-autodev-${stampId}`;

export { stampId, storageAccountName, cosmosAccountName };
