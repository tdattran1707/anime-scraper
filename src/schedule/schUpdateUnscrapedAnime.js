// import { updateUnscrapedAnime } from "../database/store/update/firestore/updateUnscrapedAnime.js";
import { createJob } from "../../config/cloud_scheduler-config.js";
import dotenv from "dotenv";
dotenv.config();
const endPoint =
  "https://us-central1-anime-vietsub-aad1b.cloudfunctions.net/api/server/updateUnscrapedAnime";
const schedule = "*/10 * * * *"; // Runs every 10 minutes
const description =
  "Run every 10 minutes to update 20 unscraped docs from firestore ";
const jobName = process.env.UPDATE_UNSCRAPED_ANIME_JOB_NAME;
export const scheduleUpdateUnscrapedAnime = async () => {
  await createJob(jobName, endPoint, schedule, description);
};
// export const scheduleUpdateUnscrapedAnime = cron.schedule(
//   schedule,
//   async () => {
//     try {
//       console.log("scheduleUpdateUnscrapedAnime() scheduled! ");
//       const { message, error } = await updateUnscrapedAnime();
//       if (error) {
//         return;
//       }
//       if (message && message.toLocaleLowerCase() == "all done") {
//         scheduleUpdateUnscrapedAnime.stop();
//         return;
//       }
//     } catch (e) {
//       console.log("scheduleUpdateUnscrapedAnime Error: " + e);
//     }
//   }
// );
