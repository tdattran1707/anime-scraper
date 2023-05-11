import { page_myanimelist } from "../../../../../../config/puppeteer-config.js";
import { findMyAnimeListData } from "../model/findAndStoreAnimeBySeason.js";
import { browser } from "../../../../../../config/puppeteer-config.js";
import { collectionRef } from "../../../../../../config/firebase-config.js";
import axios from "axios";
//This function scrape myanimelist site to get the seasonLink from 1998 to 2023
//For example: https://myanimelist.net/anime/season/2023/spring
//Send post axios requests to '/addDataToFirestore at the same time
export const initializeFirestore = async () => {
  try {
    return new Promise(async (resolve) => {
      const myanimelist_url = "https://myanimelist.net/anime/season";
      let season_archive = [];
      const season_list = ["winter", "spring", "summer", "fall"];
      const currentYear = new Date().getFullYear(); //=> 2023
      let failYearList = [];
      const getData = async (animeList) => {
        let promiseList = [];
        for (let i = 0; i < animeList.length; i++) {
          console.log(animeList[i]);
          if (animeList[i]) {
            let docRef = collectionRef.doc(
              animeList[i].title.replace(/\//g, "")
            );
            let existingDoc;
            try {
              existingDoc = await docRef.get();
            } catch (e) {
              console.log(`findAndStoreDataEr: ` + e);
            }
            if (existingDoc.exists) {
              continue;
            } else {
              const baseURl = "http://127.0.0.1:8080/fastify/search";
              promiseList.push(axios.post(baseURl, animeList[i]));
            }
          }
          if (promiseList.length === 2) {
            //Adding all data to the firestore at the same time
            await Promise.allSettled(promiseList);
            promiseList = [];
          }
        }
      };
      for (let i of season_list) {
        //Getting anime from year 2023 to year 1998;
        for (let e = currentYear; e > currentYear - 26; e--) {
          let season_year = `${e.toString()}/${i}`;
          const seasonLink = `${myanimelist_url}/${season_year}`;
          console.log("seasonLink: " + seasonLink);
          const animeList = await findMyAnimeListData(
            seasonLink,
            page_myanimelist
          );
          if (!animeList) {
            failYearList.push(seasonLink);
            continue;
          }
          await getData(animeList);
        }
      }
      console.log("failYearList: " + failYearList);
      if (failYearList) {
        let i = 0;
        while (i < failYearList.length) {
          const animeList = await findMyAnimeListData(
            seasonLink,
            page_myanimelist
          );
          if (animeList) {
            await getData(animeList);
            i++;
          }
        }
      }
      resolve();
    });
  } catch (e) {
    console.log(e);
  }
};

//This function go to seasonLink to get 30 anime series and 30 anime movies to add them to the firestore at the same time
export const addDataToFirestore = async (seasonLink) => {
  try {
    const animeList = await findMyAnimeListData(seasonLink, page_myanimelist);
    let promiseList = [];
    for (let i = 0; i < animeList.length; i++) {
      let docRef = collectionRef.doc(animeList[i].title.replace(/\//g, ""));
      let existingDoc;
      try {
        existingDoc = await docRef.get();
      } catch (e) {
        console.log(`findAndStoreDataEr: ` + e);
      }
      if (existingDoc.exists) {
        continue;
      } else {
        const data = {
          isScraped: false,
          ...animeList[i],
        };

        //adding all the async set() functions to a list to run them all at once
        promiseList.push(docRef.set(data));
      }
      //Adding all data to the firestore at the same time
      await Promise.allSettled(promiseList);
    }
    await browser.close();
  } catch (e) {
    console.log(e);
  }
};
