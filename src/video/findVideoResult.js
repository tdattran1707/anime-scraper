import getEngSubPlayer from "./getEngSubPlayer.js";
import getVietSubPlayer from "./getVietSubPlayer.js";
import { collectionRef } from "../../config/firebase-config.js";
import { addNewDataToAlgoliaIndex } from "../database/store/addNew/algolia/addNewDataToAlgoliaIndex.js";
const findVideoResult = async (
  info_result,
  page,
  page_vuianime,
  page_animet,
  page_hpanda,
  page_anime47,
  page_animefull,
  page_xemanime,
  page_animetvn,
  page_yugen,
  page_gogo,
  page_animeowl,
  page_gogoanime_dub,
  page_allanime_dub,
  page_allanime
) => {
  return new Promise(async (resolve, reject) => {
    let returned_result = info_result.returned_result;
    const title = returned_result["title"];
    console.log("title: " + title);
    try {
      const player_list = await Promise.allSettled([
        getVietSubPlayer(
          info_result,
          page,
          page_vuianime,
          page_animet,
          page_anime47,
          page_hpanda,
          page_animefull,
          page_xemanime,
          page_animetvn
        ),
        getEngSubPlayer(
          info_result,
          page_allanime,
          page_yugen,
          page_animeowl,
          page_gogo,
          page_gogoanime_dub,
          page_allanime_dub
        ),
      ]);
      console.log(player_list);
      const viet_sub_episode_list = player_list[0] ? player_list[0].value : [];
      const eng_sub_episode_list = player_list[1] ? player_list[1].value : [];
      returned_result["vietSub"] = viet_sub_episode_list;
      returned_result["engSub"] = eng_sub_episode_list;
      //get the Date when the document is created to update expired episode url
      const date = new Date().toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      }); //syntax: toLocaleDateString(locales, options)
      //ex: Tuesday, Mar 28, 2023
      returned_result["updatedOn"] = date;
    } catch (e) {
      console.log(`watch_error: ${e}`);
    } finally {
      console.log("saving..");
      const docRef = collectionRef.doc(title);
      const objectId = title;
      Promise.allSettled([
        docRef.set(returned_result), //Save data to firestore
        addNewDataToAlgoliaIndex(objectId, returned_result), //save data to algolia
      ]);
    }
  });
};
export default findVideoResult;
