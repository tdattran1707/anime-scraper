import { collectionRef } from "../../../../../config/firebase-config.js";
import axios from "axios";
import { deleteJob } from "../../../../../config/cloud_scheduler-config.js";
import dotevn from "dotenv";
dotevn.config();
export const updateUnscrapedAnime = async () => {
  //Get 20 docs that are unscraped from firestore
  try {
    const docs = await collectionRef
      .where("isScraped", "==", false)
      .limit(20)
      .get();
    if (docs.size === 0) {
      //If every document is already scraped, delete the scheduled job
      const jobName = process.env.UPDATE_UNSCRAPED_ANIME_JOB_NAME;
      await deleteJob(jobName);
    } else {
      const unscrapedDocs = docs.docs.map((el) => el.data());
      const baseURl =
        "https://us-central1-anime-vietsub-aad1b.cloudfunctions.net/api/server/updateUnscrapedAnime";
      const headers = {
        Authorization: "BASIC " + process.env.ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      await Promise.allSettled(
        unscrapedDocs.map(async (data) => {
          const requiredFields = [
            "id",
            "title",
            "img",
            "total_eps",
            "title_english",
          ];
          //Check if data object includes all required fields before sending the axios request
          if (
            Object.keys(data).every(el, (index) => el === requiredFields[index])
          ) {
            //make a http request to trigger the storeData function that update the unscrapedAnime
            return axios.post(baseURl, data, { headers });
          }
        })
      );
    }
  } catch (e) {
    console.log("updateUnscrapedAnimeEr: " + e);
  }
};
