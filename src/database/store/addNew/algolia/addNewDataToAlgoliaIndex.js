import { algoliaIndex } from "../../../../../config/algolia-config.js";

export async function addNewDataToAlgoliaIndex(objectID, data) {
  try {
    const recordExists = await algoliaIndex.exists(objectID);
    console.log("recordExists: " + recordExists);
    if (data && !recordExists) {
      await algoliaIndex.saveObject(data);
    }
  } catch (e) {
    console.log("addNewDataToAlgoliaIndex: " + e);
  }
}
