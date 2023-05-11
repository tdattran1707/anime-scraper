import cron from "node-cron";
import { addNewSeasonAnime } from "../database/store/addNew/firestore/run by season/addNewSeasonAnime.js";
import { createJob } from "../../config/cloud_scheduler-config.js";
import dotenv from "dotenv";
dotenv.config();
const endPoint =
  "https://us-central1-anime-vietsub-aad1b.cloudfunctions.net/api/server/updateUnscrapedAnime";
const schedule = "0 0 * 3 *"; //runs every day in the month of March
const description =
  "Run every 10 minutes to update 20 unscraped docs from firestore ";
const jobName = process.env.UPDATE_UNSCRAPED_ANIME_JOB_NAME;
export const scheduleAddNewCurrentSeasonAnime = async () => {
  await createJob(jobName, endPoint, schedule, description);
};
// export const scheduleAddNewCurrentSeasonAnime = cron.schedule(
//     schedule,
//     async () => {
//       try {
//         await addNewSeasonAnime();
//       } catch (e) {
//         console.log("scheduleAddNewCurrentSeasonAnimeEr: " + e);
//       }
//     },
//     {
//       //Set this to false in order to start with start method() used in the server API
//       scheduled: false,
//     }
//   );
