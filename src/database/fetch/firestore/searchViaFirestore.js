import { collectionRef } from "../../../../config/firebase-config.js";

export const searchViaFirestore = async (queryOption) => {
  let returnedList = [];
  const [key, value] = Object.entries(queryOption)[0];
  const operator = queryOption.operator;

  const result = await collectionRef.where(key, operator, value).get();
  //Ranking the anime that is most matched with the query
  if (result.size > 0) {
    result.forEach((doc) => {
      const data = doc.data();
      const numMatches = data.keywords.filter((keyword) =>
        keyword.includes(value)
      ).length;
      returnedList.push({ ...data, numMatches });
    });
  }
  return returnedList
    .sort((a, b) => b.numMatches - a.numMatches)
    .map((ele) => {
      //Remove fields "keywords" and "numMatches" from the returned results
      const entries = new Map(
        Object.entries(ele).filter(
          (el) => el[0] !== "keywords" && el[0] !== "numMatches"
        )
      );
      return Object.fromEntries(entries);
    });
};
