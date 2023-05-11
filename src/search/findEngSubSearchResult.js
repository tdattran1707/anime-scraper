import {
  findBestTitleInArray,
  findSearchTitle,
  delay,
} from "../../utils/utils.js";
import { mkdirSync } from "fs";
import { findSearchModel } from "./models/findSearchModel.js";
import { ANIME } from "@consumet/extensions";
export const findBestYugenResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const site_address = `https://yugen.to/discover/?q=${title_synonym}`;
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : title_synonym.split(" ")[0];
    const backup_site_address = `https://yugen.to/discover/?q=${backup_search_title}`;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const backup_site_address2 = `https://yugen.to/discover/?q=${backup_search_title2}`;
    const title_elem = "a.anime-meta > div.anime-data > span.anime-name";
    const link_elem = "a.anime-meta";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const episode_elem = null;
    const title_backup_option = null;
    const searchOpts = {
      page,
      site_address,
      title_option,
      link_elem,
      episode_elem,
      backup_site_address,
      title_backup_option,
      backup_site_address2,
      title_synonym,
      title_english,
    };
    const best_result = await findSearchModel(searchOpts);
    return best_result;
  } catch (e) {
    console.log("findBestYugenResultEr: " + e);
    return null;
  }
};
export const findBestAllanimeResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );
    await Promise.allSettled([
      await page.goto("https://allanime.to/anime?tr=sub&cty=ALL", {
        waitUntil: "networkidle2",
        timeout: 20000,
      }),
      await page.bringToFront(),
    ]);

    await page.evaluate(() => {
      const input = document.querySelector("input");
      input.click();
    });
    await delay(400);
    await page.waitForSelector("input", {
      timeout: 20000,
    });
    await page.click("input");
    await page.type("input", title_synonym, { delay: 40 });
    await delay(3000);
    //Taking pictures to mimic human-like behaviors
    const path = `src/screenshots`;
    try {
      await page.screenshot({
        path: `${path}/findBestAllanimeResult.png`,
        fullPage: true,
      });
    } catch {
      mkdirSync(path);
      await page.screenshot({
        path: `${path}/findBestAllanimeResult.png`,
        fullPage: true,
      });
    }
    await page.waitForSelector("a.text-light.card-text.card-title", {
      timeout: 20000,
    });
    const title_and_link_list = await page.$$eval(
      "a.text-light.card-text.card-title",
      (data) => {
        return data.map((el) => {
          return {
            title_list: [el.textContent.trim()],
            link: el.href,
          };
        });
      }
    );

    if (!title_and_link_list || title_and_link_list.length === 0) {
      return null;
    }
    const allanime_result = findBestTitleInArray(
      title_and_link_list,
      title_synonym,
      title_english
    );
    return allanime_result || null;
  } catch (e) {
    console.log("find_best_all_anime_result_er: " + e);
    return null;
  }
};
export const findBestGogoResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://gogoanime.tel/search.html?keyword=${search_title}`;
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : title_synonym.split(" ")[0];
    const backup_site_address = `https://gogoanime.tel/search.html?keyword=${backup_search_title}`;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const backup_site_address2 = `https://gogoanime.tel/search.html?keyword=${backup_search_title2}`;
    const title_elem = "p.name > a";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const link_elem = "p.name > a";
    const episode_elem = "";
    const title_backup_option = null;
    const searchOpts = {
      page,
      site_address,
      title_option,
      link_elem,
      episode_elem,
      backup_site_address,
      title_backup_option,
      backup_site_address2,
      title_synonym,
      title_english,
    };
    const best_result = await findSearchModel(searchOpts);
    return best_result || null;
  } catch (e) {
    console.log("findBestAllanimeResultEr: " + e);
    return null;
  }
};
export const findBestAnimeowlResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://animeowl.net/search/${search_title}`;
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : title_synonym.split(" ")[0];
    const backup_site_address = `https://animeowl.net/search/${backup_search_title}`;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const backup_site_address2 = `https://animeowl.net/search/${backup_search_title2}`;
    const title_elem = "h3.anime-title.mt-2";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const link_elem =
      "a.title-link.text2row.text-decoration-none.d-block.overflow-hidden";
    const episode_elem =
      "span.position-absolute.episode-percent.text-light.r-0.b-0";
    const title_backup_option = null;
    const searchOpts = {
      page,
      site_address,
      title_option,
      link_elem,
      episode_elem,
      backup_site_address,
      title_backup_option,
      backup_site_address2,
      title_synonym,
      title_english,
    };
    const best_result = await findSearchModel(searchOpts);
    return best_result || null;
  } catch (e) {
    console.log("findBestAnimeowlResult_er: " + e);
    return null;
  }
};
export const findBestZoroResult = async (title_english) => {
  const zoro = new ANIME.Zoro();
  const results = await zoro.search(title_english);
  const title_and_link_list = results.results.map(({ title, id }) => {
    return {
      title_list: [title],
      link: id,
    };
  });
  console.log("zoro_title_and_link_list: ");
  console.log(title_and_link_list);
  const best_result = findBestTitleInArray(title_and_link_list, title_english);
  return best_result || null;
};
