import { updateExpiredEpisodeUrl } from "../database/store/update/firestore/updateExpiredEpisodeUrl.js";
import { updateCurrentSeasonAnimeNewEpisode } from "../database/store/update/firestore/updateCurrentSeasonAnimeNewEpisode.js";
import cron from "node-cron";
import { createJob } from "../../config/cloud_scheduler-config.js";
import dotenv from "dotenv";
dotenv.config();
const endPoint =
  "https://us-central1-anime-vietsub-aad1b.cloudfunctions.net/api/server/updateAnime";
const schedule = "0 0 * * *"; // run every day at midnight
const description =
  "Run every day to update expired video urls and new released episodes ";
const jobName = process.env.UPDATE_UNSCRAPED_ANIME_JOB_NAME;
export const scheduleUpdateAnime = async () => {
  await createJob(jobName, endPoint, schedule, description);
};
// const schedule = "0 0 * * *"; // run every day at midnight
// export const scheduleUpdateAnime = cron.schedule(schedule, async () => {
//   try {
//     await Promise.all([
//       //Get 50 docs that has vietsub last updated 5 days agp
//       //Get 50 docs that has engsub last updated 14 days ago
//       //Get the episodeUrl of the docs to scrape again to update the expireed video URLs.
//       updateExpiredEpisodeUrl(),

//       //Get 30 docs with prop "isCurrentSeason" == true
//       //Extract some fields from the docs to do the scraping process again to update new released episodes
//       updateCurrentSeasonAnimeNewEpisode(),
//     ]);
//   } catch (e) {
//     console.log("scheduleUpdateAnimeEr: " + e);
//   }
// });
