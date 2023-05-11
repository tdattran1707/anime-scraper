import findSearchResult from "../../../../../search/findSearchResult.js";
import findEpLists from "../../../../../info/findEpLists.js";
import findVideoResult from "../../../../../video/findVideoResult.js";
import { addNewDataToAlgoliaIndex } from "../../algolia/addNewDataToAlgoliaIndex.js";
import {
  findAttributeContent,
  findTextContent,
} from "../../../../../../utils/utils.js";
import { collectionRef } from "../../../../../../config/firebase-config.js";
import { findConditionName } from "../../../../../../utils/utils.js";
export const findMyAnimeListData = async (seasonLink, page) => {
  try {
    await page.goto(seasonLink, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    let numberWantedAnime;
    //Finding the year of the anime
    //example: seasonLink= "https://myanimelist.net/anime/season/2023/winter"
    //splitSeasonLink = [https://myanimelist.net, anime, season, 2023, winter]
    const splitSeasonLink = seasonLink.split("/");
    const season = splitSeasonLink.pop(); //winter
    const year = splitSeasonLink.pop(); //2023
    console.log(year);
    if (Number(year) <= 2010) {
      numberWantedAnime = 7;
    } else {
      numberWantedAnime = 5;
    }
    const findAnimeData = async (isMovie) => {
      const index = isMovie ? "6" : "1";
      const animeData = await Promise.allSettled([
        findAttributeContent(
          page,
          `div.seasonal-anime-list:nth-of-type(${index}) > div.seasonal-anime.js-seasonal-anime > div:nth-of-type(1) > div.genres.js-genre`,
          "id"
        ), // find mal_id
        findTextContent(
          page,
          `div.seasonal-anime-list:nth-of-type(${index}) > div.seasonal-anime.js-seasonal-anime > div:nth-of-type(1) > div.title > div.title-text > .h2_anime_title > .link-title`
        ), //find title
        findTextContent(
          page,
          `div.seasonal-anime-list:nth-of-type(${index}) > div.seasonal-anime.js-seasonal-anime > div:nth-of-type(1) > div.prodsrc > .info > span:nth-child(2) > span:nth-child(1)`
        ), //find total_eps
        page.$$eval(
          `div.seasonal-anime-list:nth-of-type(${index}) > div.seasonal-anime.js-seasonal-anime > div.image > a:nth-child(1) > img`,
          (data) => {
            return data.map(
              (el) => el.src || el.srcset || el.getAttribute("data-src")
            );
          }
        ),
        findTextContent(
          page,
          `div.seasonal-anime-list:nth-of-type(${index}) > div.seasonal-anime.js-seasonal-anime > div:nth-of-type(1) > div.prodsrc > div.info > span:nth-child(1)`
        ), //find airedDate
      ]);
      return animeData;
    };
    const responseData = await Promise.allSettled([
      findAnimeData(false),
      findAnimeData(true),
    ]);
    const animeSeriesData = responseData[0].value || [];
    const animeMovieData = responseData[1].value || [];
    const findFinalAnimeList = async (data) => {
      const id_list = data[0].value;
      const title_list = data[1].value;
      const total_eps_list = data[2].value.map((el) =>
        el.replace("eps", "").trim()
      );
      const img_list = data[3].value;
      const airedDate_list = data[4].value;
      const finalAnimeList = title_list
        .slice(0, title_list.length - numberWantedAnime)
        .map((ele, index) => {
          return {
            title: ele,
            id: id_list[index],
            img: img_list[index] || "",
            total_eps: total_eps_list[index],
            airedDate: airedDate_list[index],
          };
        });

      let start_index = 1; //this is the starting posiiton of the nth-child div that is not an ad
      //Because myanimelist CSS always changes => title_english_query_selector would be incorrect sometimes
      //=> have to do this way to find out the correct nth-child order to find title_english correctly
      //ex: sometimes title_english selector is at nth-child(2), but sometimes it is at nth-child(3) when myanimelist site changes its HTML
      while (start_index <= finalAnimeList.length) {
        start_index++;
        const className = await page.$eval(
          `#content > div.js-categories-seasonal > div.seasonal-anime-list.js-seasonal-anime-list > div:nth-of-type(${start_index})`,
          (data) => data.className
        );
        if (
          className.includes(
            "js-anime-category-producer seasonal-anime js-seasonal-anime js-anime-type-all"
          )
        ) {
          break;
        }
      }

      for (let i = 0; i < finalAnimeList.length; i++) {
        let title_english;
        try {
          //Sometimes, there are advertisement div in between them
          //This way will skip that div of ad
          for (
            let nthChild = i + start_index;
            nthChild <= finalAnimeList.length;
            nthChild++
          ) {
            const className = await page.evaluate(
              `document.querySelector("#content > div.js-categories-seasonal > div.seasonal-anime-list.js-seasonal-anime-list > div:nth-child(${
                i + start_index
              })").className`
            );
            if (
              !className.includes(
                "js-anime-category-producer seasonal-anime js-seasonal-anime js-anime-type-all"
              )
            ) {
              start_index++;
            } else {
              break;
            }
          }
          title_english = await page.$eval(
            `#content > div.js-categories-seasonal > div:nth-child(1) > div:nth-child(${
              i + start_index
            }) > div:nth-child(1) > div.title > div.title-text > h3`,
            (data) => data.textContent
          );
        } catch (er) {
          title_english = finalAnimeList[i].title;
        }
        finalAnimeList[i].title_english = title_english;
        const request_title = findConditionName(finalAnimeList[i].title);
        console.log("title: " + request_title);
      }
      return finalAnimeList;
    };
    const dataAnimeList = await Promise.allSettled([
      findFinalAnimeList(animeSeriesData),
      findFinalAnimeList(animeMovieData),
    ]);
    const animeSeriesList = dataAnimeList[0].value || [];
    const animeMovieList = dataAnimeList[1].value || [];
    const finalAnimeList = animeSeriesList.concat(animeMovieList);
    return finalAnimeList;
  } catch (e) {
    console.log("findMyAnimeListData: " + e);
  }
};
export const findAndStoreAnimeBySeason = async (isCurrentSeason, data) => {
  try {
    if (data) {
      const search_result = await findSearchResult(
        data.id,
        data.title,
        data.img,
        data.total_eps,
        data.title_english,
        isCurrentSeason
      );
      const info_result = await findEpLists(search_result);
      const video_result = await findVideoResult(info_result);
      const title = data.title;
      console.log("title: " + title);

      //Saving new Document to firestore
      const docRef = collectionRef.doc(title);
      docRef.set(video_result);

      //Saving new Record to Algolia Index
      const objectID = title;
      const newRecord = {
        objectID,
        ...video_result,
      };
      await addNewDataToAlgoliaIndex(objectID, newRecord);
    }
  } catch (e) {
    console.log("findAndStoreAnimeBySeasonEr: " + e);
  }
};
