import { findEps } from "./findEps.js";
import { byPassSecurity, delay } from "../../utils/utils.js";
export async function findAnimeazEps(page, animeazIsPartAnime, totalEps) {
  try {
    const watch_btn_elem = "a.first.button";
    const list_of_eps_elem = "div.watch__wrapper-list > a";
    const episode_list = await findEps(
      page,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      animeazIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findAnimeazEpsEr: " + e);
    return [];
  }
}
export async function findVuianimeEps(
  page_vuianime,
  vuianimeIsPartAnime,
  totalEps
) {
  try {
    const watch_btn_elem = "a.btn-danger";
    const list_of_eps_elem = "ul#list_episodes > li > a";
    const episode_list = await findEps(
      page_vuianime,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      vuianimeIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findVuianimeEpsEr: " + e);
    return [];
  }
}
export async function findAnimetEps(page_animet, animetIsPartAnime, totalEps) {
  try {
    const watch_btn_elem =
      "#Tp-Wp > div.Body.Container > div > div.TpRwCont > main > article > header > div.Image > a.watch_button_more";
    const list_of_eps_elem = "#list-server > div:nth-child(1) > ul > li > a";
    const episode_list = await findEps(
      page_animet,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      animetIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findAnimetEpsEr: " + e);
    return [];
  }
}
export async function findHpandaEps(page_hpanda, hpandaIsPartAnime, totalEps) {
  try {
    const watch_btn_elem =
      "body > div.container > div.row > div.detail-bl.myui-panel.col-pd.clearfix > div.myui-content__thumb > div > a.btn.btn-default.btn-block.btn-watch";
    const list_of_eps_elem = "#tab_0 > ul > li > a";
    const episode_list = await findEps(
      page_hpanda,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      hpandaIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findHpandaEpsEr: " + e);
    return [];
  }
}
export async function findAnime47Eps(
  page_anime47,
  anime47IsPartAnime,
  totalEps
) {
  try {
    const anime47_watch_btn = await page_anime47.$eval(
      "li.item > a.btn.btn-red#btn-film-watch",
      (data) => data.getAttribute("href").replace("./", "https://anime47.com/")
    );

    if (anime47_watch_btn === "javascript:void(0)") {
      return [];
    }
    await page_anime47.goto("https://anime47.com/xac-nhan.html", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    try {
      let stopFlag = false;
      setTimeout(() => {
        stopFlag = true;
      }, 40000);
      const security_question = await page_anime47.$("#muoi");
      if (security_question) {
        await byPassSecurity(page_anime47, anime47_watch_btn);
      }
      await delay(2000);
      await page_anime47.goto(anime47_watch_btn, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      await page_anime47.waitForSelector("a.btn-episode", { timeout: 6000 });
      let anime_episode_list = await page_anime47.$$eval(
        "a.btn-episode",
        (data) => {
          return data.map((el) => {
            return {
              ep_num: Number(el.textContent.trim().replace("_END", "")),
              ep_link: el.getAttribute("href"),
            };
          });
        }
      );

      if (anime47IsPartAnime && anime_episode_list) {
        const total_eps_of_part_2 = totalEps["totalEpisodes"];
        //Because at animet site, part-2 anime is merged into part-1, ex: spy x family part 2 is merged into spy x family
        //=> total_eps_of_part_2 of anime_episode_list could be 20 (for both parts)
        //Find just episodes of part 2
        const total_eps_of_part_1 =
          anime_episode_list.length - total_eps_of_part_2;
        const first_ep_of_part_2 = total_eps_of_part_1 + 1;
        anime_episode_list = anime_episode_list.filter(({ ep_num }) => {
          return Number(ep_num) >= first_ep_of_part_2;
        });
        anime_episode_list = anime_episode_list.map(({ ep_num, ep_link }) => {
          return {
            ep_num: ep_num.replace(
              ep_num,
              (ep_num - total_eps_of_part_1).toString()
            ),
            ep_link: ep_link,
          };
        });
      }
      if (stopFlag) {
        return [];
      }
      return (
        anime_episode_list.filter(
          ({ ep_num }, index, self) =>
            self.findIndex((el) => el.ep_num === ep_num) === index ||
            !isNaN(Number(ep_num)) ||
            ep_num === "Full"
        ) || []
      );
    } catch (e) {
      console.log(e);
      await byPassSecurity(page_anime47, anime47_watch_btn);
      await findAnime47Eps(page_anime47, anime47IsPartAnime, totalEps);
    }
  } catch (e) {
    console.log("findAnime47Eps: " + e);
    return [];
  }
}
export async function findAnimefullEps(
  page_animefull,
  animefullIsPartAnime,
  totalEps
) {
  try {
    const watch_btn_elem =
      "body > div:nth-child(9) > div.left-content > div.dynamic-header-overlay > div > div:nth-child(4) > div > div > a";
    const list_of_eps_elem = "ul#list_episodes:nth-of-type(1) > li > a";
    const episode_list = await findEps(
      page_animefull,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      animefullIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findAnimefullEpsEr: " + e);
    return [];
  }
}
export async function findXemanimeEps(
  page_xemanime,
  xemanimeIsPartAnime,
  totalEps
) {
  try {
    const watch_btn_elem =
      "#ah_wrapper > div:nth-child(4) > div.info-movie > div.flex.ah-frame-bg.flex-wrap > div.flex.flex-wrap.flex-1 > a.padding-5-15.fs-35.button-default.fw-500.fs-15.flex.flex-hozi-center.bg-lochinvar";
    const list_of_eps_elem = ".list-item-episode.scroll-bar > a";
    const episode_list = await findEps(
      page_xemanime,
      watch_btn_elem,
      list_of_eps_elem,
      "title",
      xemanimeIsPartAnime,
      totalEps
    );

    return episode_list.reverse() || [];
  } catch (e) {
    console.log("findXemanimeEpsEr: " + e);
    return [];
  }
}
export async function findAnimetvnEps(
  page_animetvn,
  animetvnIsPartAnime,
  totalEps
) {
  try {
    const watch_btn_elem = "a.btn.play-now";
    const list_of_eps_elem = "a.tapphim ";
    const episode_list = await findEps(
      page_animetvn,
      watch_btn_elem,
      list_of_eps_elem,
      null,
      animetvnIsPartAnime,
      totalEps
    );

    return episode_list || [];
  } catch (e) {
    console.log("findAnimetvnEps: " + e);
    return [];
  }
}
