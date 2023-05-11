import { getEpisodeFullDetails } from "../../utils/utils.js";
import {
  getAllanimePlayer,
  getYugenPlayer,
  getAnimeowlPlayer,
  getGogoanimePlayer,
} from "./getPlayer.js";

const getEngSubPlayer = async (
  info_result,
  page_allanime,
  page_yugen,
  page_animeowl,
  page_gogo,
  page_gogoanime_dub,
  page_allanime_dub
) => {
  console.log("eng");
  let eng_sub_episode_list;
  const yugenEpList = info_result.yugenEpList || [];
  const allanimeEpList = info_result.allanimeEpList || [];
  const gogoanimeEpList = info_result.gogoanimeEpList || [];
  const gogoanimeDubEpList = info_result.gogoanimeDubEpList || [];
  const animeowlEpList = info_result.animeowlEpList || [];
  const zoroEpList = info_result.zoroEpList || [];
  const listOfEpisodesWithTitle = info_result.listOfEpisodesWithTitle;
  try {
    const getBestEnglishVideo = async (promise_player_list) => {
      let episode_details;
      if (
        allanimeEpList &&
        allanimeEpList["total_eps"] > 0 &&
        allanimeEpList["sub"]
      ) {
        episode_details = allanimeEpList["sub"].map(({ ep_title, ep_img }) => {
          return {
            ep_img,
            ep_title,
          };
        });
      } else if (yugenEpList && yugenEpList.length > 0) {
        episode_details = yugenEpList.map(({ ep_img, ep_title }) => {
          return {
            ep_img,
            ep_title,
          };
        });
      }
      const result = await getEpisodeFullDetails(
        promise_player_list,
        "engSub",
        listOfEpisodesWithTitle,
        episode_details
      );
      return result || [];
    };
    const promise_eng_dub_player_list = [
      getGogoanimePlayer(page_gogoanime_dub, gogoanimeDubEpList, true),
      getAllanimePlayer(
        page_allanime_dub,
        allanimeEpList && allanimeEpList["dub"] ? allanimeEpList["dub"] : [],
        true
      ),
    ];
    const promise_eng_sub_player_list = [
      getGogoanimePlayer(page_gogo, gogoanimeEpList),
      getAnimeowlPlayer(page_animeowl, animeowlEpList),
      getYugenPlayer(page_yugen, yugenEpList),
      getAllanimePlayer(
        page_allanime,
        allanimeEpList && allanimeEpList["sub"] ? allanimeEpList["sub"] : []
      ),
    ];
    const promise_player_list = [
      getBestEnglishVideo(promise_eng_sub_player_list),
      getBestEnglishVideo(promise_eng_dub_player_list),
    ];

    const result = await Promise.allSettled(promise_player_list);
    const engSub_episode_full_details = result[0].value;
    const engDub_episode_full_details = result[1]?.value || [];
    eng_sub_episode_list = {
      sub: engSub_episode_full_details,
      dub: engDub_episode_full_details,
    };
  } catch (e) {
    console.log("getEngSubPlayerErr2: " + e);
  } finally {
    return eng_sub_episode_list;
  }
};
export default getEngSubPlayer;
