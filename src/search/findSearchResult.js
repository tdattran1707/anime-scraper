import {
  findBestAnimeazResult,
  findBestVuianimeResult,
  findBestAnimetResult,
  findBestAnime47Result,
  findBestHpandaResult,
  findBestAnimeFullResult,
  findBestXemanimeResult,
  findBestAnimetvnResult,
} from "./findVietSubSearchResult.js";
import {
  findBestAllanimeResult,
  findBestYugenResult,
  findBestGogoResult,
  findBestAnimeowlResult,
  findBestZoroResult,
} from "./findEngSubSearchResult.js";
import { findTimeStamps } from "./findTimeStamps.js";
import { findRelations } from "./findRelations.js";
import { findWatchOrder } from "./findWatchOrder.js";
import { findEpisodeTitle } from "./findEpisodeTitle.js";
// import {
//   page_relation,
//   page_watch_order,
//   page_vuighe,
//   page,
//   page_vuianime,
//   page_animet,
//   page_anime47,
//   page_hpanda,
//   page_animefull,
//   page_xemanime,
//   page_animetvn,
//   page_allanime,
//   page_yugen,
//   page_animeowl,
//   page_gogo,
// } from "../../config/puppeteer-config.js";

import axios from "axios";

const findSearchResult = async (
  id,
  title,
  img,
  total_eps,
  title_english,
  isCurrentSeason,
  page_relation,
  page,
  page_vuianime,
  page_animet,
  page_hpanda,
  page_anime47,
  page_animefull,
  page_xemanime,
  page_animetvn,
  page_watch_order,
  page_vuighe,
  page_yugen,
  page_gogo,
  page_animeowl,
  page_allanime
) => {
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
  // );
  console.log("title_english: " + title_english);
  console.log("title: " + title);

  let returned_result = {
    title: title,
    title_english: title_english || "",
    totalEpisodes: total_eps,
    mal_id: id,
    img: img || "",
    isCurrentSeason,
  };
  let animeazFinalResult;
  let vuianimeFinalResult;
  let animetFinalResult;
  let hpandaFinalResult;
  let anime47FinalResult;
  let animefullFinalResult;
  let xemanimeFinalResult;
  let animetvnFinalResult;
  let yugenFinalResult;
  let allanimeFinalResult;
  let gogoanimeFinalResult;
  let animeowlFinalResult;
  let zoroFinalResult;
  let listOfEpisodesWithTitle;

  try {
    const results = await Promise.allSettled([
      findWatchOrder(id, page_watch_order),
      findRelations(page_relation, title),
      findTimeStamps(id, total_eps),
      findEpisodeTitle(id, page_vuighe, title, title_english, total_eps, img),
      findBestAnimeazResult(page, title, title_english),
      findBestVuianimeResult(page_vuianime, title, title_english),
      findBestAnimetResult(page_animet, title, title_english),
      findBestHpandaResult(page_hpanda, title, title_english),
      findBestAnime47Result(page_anime47, title, title_english),
      findBestAnimeFullResult(page_animefull, title, title_english),
      findBestYugenResult(page_yugen, title, title_english),
      findBestAllanimeResult(page_allanime, title, title_english),
      findBestGogoResult(page_gogo, title, title_english),
      findBestAnimeowlResult(page_animeowl, title, title_english),
      findBestXemanimeResult(page_xemanime, title, title_english),
      findBestAnimetvnResult(page_animetvn, title, title_english),
      findBestZoroResult(title_english),
    ]);
    const watch_order = results[0].value;
    console.log("watch_order:");
    console.log(watch_order);
    returned_result["watch_order"] = watch_order;
    let relations = results[1].value;
    console.log("relations:");
    console.log(relations);
    returned_result["relations"] = relations;
    let time_stamps = results[2].value;
    console.log("time_stamps:");
    console.log(time_stamps);
    listOfEpisodesWithTitle = results[3].value;
    console.log("listOfEpisodesWithTitle:");
    console.log(listOfEpisodesWithTitle);
    returned_result["time_stamps"] = time_stamps;
    animeazFinalResult = results[4].value;
    vuianimeFinalResult = results[5].value;
    animetFinalResult = results[6].value;
    hpandaFinalResult = results[7].value;
    anime47FinalResult = results[8].value;
    animefullFinalResult = results[9].value;
    yugenFinalResult = results[10].value;
    allanimeFinalResult = results[11].value;
    gogoanimeFinalResult = results[12].value;
    animeowlFinalResult = results[13].value;
    xemanimeFinalResult = results[14].value;
    animetvnFinalResult = results[15].value;
    zoroFinalResult = results[16].value?.best_result || null;
    console.log("animeazFinalResult: ");
    console.log(animeazFinalResult);
    console.log("vuianimeFinalResult: ");
    console.log(vuianimeFinalResult);
    console.log("animetFinalResult: ");
    console.log(animetFinalResult);
    console.log("hpandaFinalResult: ");
    console.log(hpandaFinalResult);
    console.log("anime47FinalResult: ");
    console.log(anime47FinalResult);
    console.log("animefullFinalResult: ");
    console.log(animefullFinalResult);
    console.log("xemanimeFinalResult: ");
    console.log(xemanimeFinalResult);
    console.log("animetvnFinalResult: ");
    console.log(animetvnFinalResult);
    console.log("yugenFinalResult: ");
    console.log(yugenFinalResult);
    console.log("allanimeFinalResult: ");
    console.log(allanimeFinalResult);
    console.log("gogoanimeFinalResult: ");
    console.log(gogoanimeFinalResult);
    console.log("animeowlFinalResult: ");
    console.log(animeowlFinalResult);
    console.log("zoroFinalResult: ");
    console.log(zoroFinalResult);
    console.log("id:" + id);
  } catch (error) {
    console.log("findSearchTitle_er: " + error);
  } finally {
    const search_result = {
      animeazFinalResult,
      vuianimeFinalResult,
      animetFinalResult,
      hpandaFinalResult,
      anime47FinalResult,
      animefullFinalResult,
      xemanimeFinalResult,
      animetvnFinalResult,
      yugenFinalResult,
      allanimeFinalResult,
      gogoanimeFinalResult,
      animeowlFinalResult,
      zoroFinalResult,
      listOfEpisodesWithTitle,
      returned_result,
    };
    await axios.post("http://127.0.0.1:8080/fastify/info", { search_result });
  }
};
export default findSearchResult;
