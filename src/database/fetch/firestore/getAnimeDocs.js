import { getLocalDateString } from "../../../../utils/utils.js";
import { collectionRef } from "../../../../config/firebase-config.js";

export const getAnimeDocs = async (
  days,
  isCurrentSeason = false,
  limit = null
) => {
  try {
    const today = new Date();
    const lastUpdatedTime = new Date(
      today.getTime() - days * 24 * 60 * 60 * 1000
    );
    const lastUpdatedDate = getLocalDateString(days);
    let snapShot;
    switch (isCurrentSeason) {
      case false:
        snapShot = await collectionRef
          .where("updatedOn", "<=", lastUpdatedDate)
          .orderBy("updatedOn")
          .startAfter(lastUpdatedTime)
          .limit(limit || 50)
          .get();
        break;
      case true:
        snapShot = await collectionRef
          .where("isCurrentSeason", "==", true)
          .where("updatedOn", "<=", lastUpdatedDate)
          .orderBy("updatedOn")
          // .startAfter(lastUpdatedTime)
          .limit(limit || 50)
          .get();
    }
    const animeDocs = snapShot.docs.map((doc) => {
      return {
        docData: doc.data(),
        docId: doc.id,
      };
    });
    return animeDocs;
  } catch (e) {
    console.log("getAnimeDocsEr: " + e);
    return [];
  }
};
