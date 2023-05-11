import { page_myanimelist } from "../../../../../../config/puppeteer-config.js";
import axios from "axios";
import { scheduleUpdateUnscrapedAnime } from "../../../../../schedule/schUpdateUnscrapedAnime.js";
export const addNewSeasonAnime = async () => {
  try {
    await page_myanimelist.goto(
      "https://myanimelist.net/anime/season/2023/winter", //this is just a psuedo link
      {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      }
    );
    await page_myanimelist.waitForSelector(
      "#content > div.navi-seasonal.js-navi-seasonal > div.horiznav_nav > ul > li:nth-child(7) > a",
      { timeout: 10000 }
    );
    const currentSeasonLink = await page_myanimelist.$eval(
      "#content > div.navi-seasonal.js-navi-seasonal > div.horiznav_nav > ul > li:nth-child(7) > a",
      (data) => data.href
    );
    const baseURl =
      "https://us-central1-anime-vietsub-aad1b.cloudfunctions.net/api/server/addDatatoFirestore";
    await Promise.allSettled([
      //make a http request to trigger the addDataToFirestore function to get 30 anime series and 30 anime movies to add them to the firestore at the same time
      axios.post(baseURl, { seasonLink: currentSeasonLink }),
      //Create a scheduler job to update the recently added anime
      scheduleUpdateUnscrapedAnime(),
    ]);
  } catch (e) {
    console.log("addNewSeasonAnimeEr: " + e);
  }
};
