import { getAnimeDocs } from "../../../fetch/firestore/getAnimeDocs.js";
import findEpLists from "../../../../info/findEpLists.js";
import findVideoResult from "../../../../video/findVideoResult.js";
import { collectionRef } from "../../../../../config/firebase-config.js";
import admin from "firebase-admin";

export const updateCurrentSeasonAnimeNewEpisode = async () => {
  try {
    const currentSeasonAnimeDocs = getAnimeDocs(7, true);
    for (let eachAnime of currentSeasonAnimeDocs) {
      let returned_result = {
        title: eachAnime.docData.infoLinkList.title,
        title_english: eachAnime.docData.title_english || "",
        totalEpisodes: eachAnime.docData.total_eps,
        mal_id: eachAnime.docData.mal_id,
        img: eachAnime.docData.img || "",
        isCurrentSeason: true,
        relations: eachAnime.docData.relations,
        watch_order: eachAnime.docData.watch_order,
        time_stamps: eachAnime.docData.time_stamps,
      };
      const infoLinkList = eachAnime.docData.infoLinkList;
      const finalData = Object.assign(infoLinkList, returned_result);
      const info_result = await findEpLists(finalData);
      const video_result = await findVideoResult(info_result);

      const oldData = eachAnime.docData;
      const docRef = collectionRef.doc(eachAnime.docId);
      //Check if old data and new data is the same => no new episodes
      if (video_result == oldData) {
        const weeksOfDelayed = oldData.weeksOfDelayed;
        //Check if anime has no new episodes in 10 weeks (in case anime is delayed)
        if (weeksOfDelayed && weeksOfDelayed < 10) {
          //If less then 10 weeks, increment the weeksOfDelayed by 1
          await docRef.update({
            weeksOfDelayed: admin.firestore.FieldValue.increment(1),
          });
        } else {
          //If more than 10 weeks => this is no longer a current season anime
          await docRef.update({
            isCurrentSeaso: false,
          });
        }
      } else {
        await docRef.update({
          video_result,
        });
      }
    }
  } catch (e) {
    console.log("updateCurrentSeasonAnimeNewEpisodeEr: " + e);
  }
};
