import { algoliaIndex } from "../../../../../config/algolia-config.js";

export async function updateAlgoliaIndex(data) {
  try {
    await algoliaIndex.partialUpdateObject(data);
  } catch (e) {
    console.log("updateAlgoliaIndexEr: " + e);
  }
}
