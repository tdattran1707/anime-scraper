import { algoliaIndex } from "../../../../config/algolia-config.js";

export const searchViaAlgolia = async (query) => {
  try {
    const params = {
      optionalWords: query,
    };
    const searchResults = await algoliaIndex
      .search(query, params)
      .then(({ hits }) => {
        return hits;
      })
      .catch((err) => {
        console.log(err);
      });
    searchResults.forEach((el) => {
      const removedItemList = [
        "objectID",
        "_highlightResult",
        "lastmodified",
        "path",
      ];
      for (let key of removedItemList) {
        delete el[key];
      }
    });
    return searchResults;
  } catch (e) {
    console.log(e);
  }
};
