import { getEpisodeFullDetails } from "../../utils/utils.js";
import {
  getAnimeazPlayer,
  getVuiAnimePlayer,
  getAnimetPlayer,
  getAnime47Player,
  getAnimefullPlayer,
  getHpandaPlayer,
  getAnimetvnPlayer,
  getXemanimePlayer,
} from "./getPlayer.js";
const getVietSubPlayer = async (
  info_result,
  page,
  page_vuianime,
  page_animet,
  page_anime47,
  page_hpanda,
  page_animefull,
  page_xemanime,
  page_animetvn
) => {
  let viet_sub_episode_list;
  const animeazEpList = info_result.animeazEpList;
  const vuianimeEpList = info_result.vuianimeEpList;
  const animetEpList = info_result.animetEpList;
  const hpandaEpList = info_result.hpandaEpList;
  const anime47EpList = info_result.anime47EpList;
  const animefullEpList = info_result.animefullEpList;
  const xemanimeEpList = info_result.xemanimeEpList;
  const animetvnEpList = info_result.animetvnEpList;
  const listOfEpisodesWithTitle = info_result.listOfEpisodesWithTitle;
  try {
    const vietsub_promise_player_list = [
      getAnimeazPlayer(page, animeazEpList),
      getAnime47Player(page_anime47, anime47EpList),
      getVuiAnimePlayer(page_vuianime, vuianimeEpList),
      getAnimetPlayer(page_animet, animetEpList),
      getHpandaPlayer(page_hpanda, hpandaEpList),
      getAnimefullPlayer(page_animefull, animefullEpList),
      getXemanimePlayer(page_xemanime, xemanimeEpList),
      getAnimetvnPlayer(page_animetvn, animetvnEpList),
    ];

    viet_sub_episode_list = await getEpisodeFullDetails(
      vietsub_promise_player_list,
      "vietSub",
      listOfEpisodesWithTitle
    );
  } catch (e) {
    console.log("getVietSubPlayerErr: " + e);
  } finally {
    return viet_sub_episode_list;
  }
};
export default getVietSubPlayer;
