import express from "express";
import cors from "cors";
import dotevn from "dotenv";
import { findAndStoreAnimeBySeason } from "../database/store/addNew/firestore/model/findAndStoreAnimeBySeason.js";
import {
  initializeFirestore,
  addDataToFirestore,
} from "../database/store/addNew/firestore/run once/addDataToFirestore.js";
import { addNewSeasonAnime } from "../database/store/addNew/firestore/run by season/addNewSeasonAnime.js";
import { scheduleUpdateAnime } from "../schedule/schUpdateAnime.js";
import { scheduleAddNewCurrentSeasonAnime } from "../schedule/schAddNewSeasonAnime.js";
import { scheduleUpdateUnscrapedAnime } from "../schedule/schUpdateUnscrapedAnime.js";
import { deleteJob } from "../../config/cloud_scheduler-config.js";
dotevn.config();
const serverRouter = express.Router();
serverRouter.use(cors());
serverRouter.use(express.json());
//----------------------SERVER ONLY ACCESSIBLES----------------//

//update the upscraped anime
//Use the sent data body for example: {
//id,
//title,
//img,
//total_eps,
//title_english,
//} to scrape for data
serverRouter.post("/updateUnscrapedAnime", async (req, res) => {
  try {
    //Authenticating if the request to sent from me
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "403 Forbidden Access" });
    }
    //Getting the token
    //for example: BASIC {token}
    const token = authHeader.split(" ")[1];
    if (token === process.env.ACCESS_TOKEN) {
      console.log("authentication matched!");
      const data = req.body;
      await findAndStoreAnimeBySeason(false, data);
    }
  } catch (e) {
    console.log(e);
  }
});
//go to seasonLink to get 30 anime series and 30 anime movies to add them to the firestore at the same time
serverRouter.post("/addDataToFirestore", async (req, res) => {
  const seasonLink = req.body.seasonLink;
  try {
    await addDataToFirestore(seasonLink);
    res.send("Add Data Successfully!");
  } catch (e) {
    console.log(e);
  }
});

serverRouter.get("/addNewSeasonAnime", async (req, res) => {
  try {
    await addNewSeasonAnime();
    res.send("Add Data Successfully!");
  } catch (e) {
    res.send("addNewSeasonAnime Error: " + e);
    console.log(e);
  }
});

//******************* RUN ONCE ************************//
//start the cron job to run once
//Scrape myanimelist site to get the seasonLink from 1998 to 2023
//For example: https://myanimelist.net/anime/season/2023/spring
//Send post axios requests to '/addDataToFirestore at the same time
serverRouter.get("/initializeFirestore", async (req, res) => {
  try {
    await initializeFirestore();
    res.send("Initializing Firestore...");
  } catch (e) {
    console.log(e);
    res.send("initializeFirestore Error: " + e);
  }
});

//******************* REPEATEDLY ************************//

//start the cron job to run every 10 minutes
//send 20 https request at the same time to "/storeData" to update the unscraped anime
serverRouter.get("/schUpdateUnscrapedAnime", async (req, res) => {
  try {
    await scheduleUpdateUnscrapedAnime();
    res.send("Scheduled Successfully!");
  } catch (e) {
    res.send("schUpdateUnscrapedAnime Error: " + e);
  }
});

//start the cron job to run every midnight
//to update expired episode url and update newly released episode of current season anime
serverRouter.get("/schUpdateAnime ", async (req, res) => {
  try {
    await scheduleUpdateAnime();
    res.send("Scheduled Successfully!");
  } catch (e) {
    res.send("schUpdateAnime Error: " + e);
  }
});

//start the cron job to run every day in the month of March
//to add new current season anime
serverRouter.get("/schAddNewCurrentSeasonAnime", async (req, res) => {
  try {
    await scheduleAddNewCurrentSeasonAnime();
    res.send("Scheduled Successfully!");
  } catch (e) {
    res.send("schAddNewCurrentSeasonAnime Error: " + e);
  }
});
export default serverRouter;

//******************* Cancel Cron Jobs ************************//

//Cancel the schUpdateUnscrapedAnime() cron job
serverRouter.get("/cancelUnscraped", async (req, res) => {
  try {
    const jobName = process.env.UPDATE_UNSCRAPED_ANIME_JOB_NAME;
    await deleteJob(jobName);
    res.send("Cancel schedule update unscraped Successfully!");
  } catch (e) {
    res.send("cancelUnscraped Error: " + e);
  }
});

//Cancel the schUpdateAnime() cron job
serverRouter.get("/cancelUpdate", async (req, res) => {
  try {
    const jobName = process.env.UPDATE_ANIME_JOB_NAME;
    await deleteJob(jobName);
    res.send("Cancel schedule update anime Successfully!");
  } catch (e) {
    res.send("cancelUnscraped Error: " + e);
  }
});

//Cancel the scheduleAddNewCurrentSeasonAnime() cron job
serverRouter.get("/cancelAddCurrentSeason", async (req, res) => {
  try {
    const jobName = process.env.ADD_NEW_CURRENT_SEASON_ANIME_JOB_NAME;
    await deleteJob(jobName);
    res.send("Cancel schedule add new current season anime Successfully!");
  } catch (e) {
    res.send("cancelUnscraped Error: " + e);
  }
});
