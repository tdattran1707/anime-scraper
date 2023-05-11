import {
  findAttributeContent,
  findTextContent,
  delay,
  autoScroll,
} from "../../utils/utils.js";
import { load } from "cheerio";
import axios from "axios";
export async function findYugenEps(page) {
  try {
    const watch_btn_elem =
      "body > main > div.page-header > div > div.content > div.navigation > a:nth-child(2)";
    const watch_btn = await page.$eval(watch_btn_elem, (data) => data.href);

    await page.goto(watch_btn, { waitUntil: "networkidle2", timeout: 20000 });
    const episode_title_elem = "a.ep-title";
    const episode_img_elem = "img.lozad";
    const episode_link_elem = "a.ep-title";
    const result = await Promise.all([
      findAttributeContent(page, episode_link_elem, "href"),
      findTextContent(page, episode_title_elem),
      findAttributeContent(page, episode_img_elem, "data-src"),
    ]);
    const episode_link_list = result[0];
    const episode_title_list = result[1];
    const episode_img_list = result[2];
    let episode_list = [];
    for (let i = 0; i < episode_title_list.length; i++) {
      episode_list.push({
        ep_title: episode_title_list[i] || "",
        ep_img: episode_img_list[i] || "",
        ep_link: episode_link_list[i],
        ep_num: i + 1,
      });
    }
    return episode_list || [];
  } catch (e) {
    console.log("findYugenEpsEr: " + e);
    return [];
  }
}
export async function findAllanimeEps(page) {
  try {
    const find_mode = async () => {
      try {
        let mode = await page.$eval(
          "div.card:nth-of-type(1) > div.list-group:nth-of-type(2) > div.eplist-mode > button",
          (data) => {
            return data.textContent.trim();
          }
        );
        return mode;
      } catch (e) {
        console.log("findAllanimeEpsEr: " + e);
      }
    };
    let mode = await find_mode();
    while (mode && !mode.toLowerCase().includes("thumbnail")) {
      try {
        await page.evaluate(() => {
          const mode = document.querySelector(
            "div.card:nth-of-type(1) > div.list-group:nth-of-type(2) > div.eplist-mode > button"
          );
          mode.click();
        });
        await delay(500);
        mode = await find_mode();
      } catch (e) {
        console.log("getAllanimeRunModeEr: " + e);
      }
    }

    await page.evaluate(() => {
      const dubConTainerButton = document.querySelector(
        "#episodeList-heading-dub > div > div:nth-child(1)"
      );
      dubConTainerButton.click();
    });
    await autoScroll(page);
    const find_list = async (sub_element, dub_element, attribute = null) => {
      return new Promise(async (resolve) => {
        let promise_list = attribute
          ? [
              findAttributeContent(page, sub_element, attribute),
              findAttributeContent(page, dub_element, attribute),
            ]
          : [
              findTextContent(page, sub_element),
              findTextContent(page, dub_element),
            ];
        const result = await Promise.allSettled(promise_list);
        const sub_ep_list = result[0].value || [];
        const dub_ep_list = result[1].value || [];
        resolve({
          sub: sub_ep_list,
          dub: dub_ep_list,
        });
      });
    };

    let promise_list = [
      find_list(
        "#episodeListAccordion > div:nth-child(1) > div:nth-of-type(2) > div:nth-of-type(4) > a",
        "#episodeListAccordion > div:nth-child(2) > div:nth-of-type(2) > div:nth-of-type(4) > a",
        "href"
      ), // find link list
      find_list(
        "#episodeListAccordion > div:nth-child(1) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > div.ep-title",
        "#episodeListAccordion > div:nth-child(2) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > div.ep-title"
      ), //find ep_num list
      find_list(
        "#episodeListAccordion > div:nth-child(1) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > img",
        "#episodeListAccordion > div:nth-child(2) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > img",
        "src"
      ), //find img list
      find_list(
        "#episodeListAccordion > div:nth-child(1) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > div.nth-of-type(4)",
        "#episodeListAccordion > div:nth-child(2) > div:nth-of-type(2) > div:nth-of-type(4) > a > div:nth-of-type(1) > div:nth-of-type(1) > div.nth-of-type(4)"
      ), // find ep_title list
    ];

    await page.bringToFront();
    const result = await Promise.allSettled(promise_list);
    const link_list = result[0].value;
    const ep_num_list = result[1].value;
    const img_list = result[2].value;
    const ep_title_list = result[3].value;

    let allanime_ep_list = {
      sub: [],
      dub: [],
    };

    for (let key of Object.keys(allanime_ep_list)) {
      for (let i = 0; i < link_list[key].length; i++) {
        const ep_title =
          ep_num_list[key] &&
          ep_num_list[key].length > 0 &&
          ep_title_list[key] &&
          ep_title_list[key].length > 0
            ? `${ep_num_list[key][i]} - ${ep_title_list[key][i]}`
            : `Episode ${i + 1}`;
        const ep_num = Number(
          ep_num_list[key] &&
            ep_num_list[key][i] &&
            ep_num_list[key][i].replace("Episode", "").trim()
        );
        allanime_ep_list[key].push({
          ep_link: link_list[key][i],
          ep_num: Number.isInteger(ep_num) ? ep_num : ep_num + 0.5,
          ep_title: ep_title || "",
          ep_img: img_list[key][i] || "",
        });
      }
      allanime_ep_list[key].reverse();
    }
    allanime_ep_list["total_eps"] = link_list["sub"].length;

    return allanime_ep_list || [];
  } catch (e) {
    console.log("findAllanimeEpsEr: " + e);
    return [];
  }
}
export async function findGogoanimeEps(page) {
  const episode_link_elem = "ul#episode_related > li > a";
  const episode_num_elem = "ul#episode_related > li > a > div.name";
  try {
    const result = await Promise.allSettled([
      findAttributeContent(page, episode_link_elem, "href"),
      findTextContent(page, episode_num_elem),
    ]);
    const episode_link_list = result[0].value;
    const episode_num_list = result[1].value;
    let episode_list = [];
    for (let i = 0; i < episode_link_list.length; i++) {
      episode_list.push({
        ep_num: episode_num_list[i].replace("EP", ""),
        ep_link: `https://gogoanime.tel${episode_link_list[i].trim()}`,
      });
    }
    return episode_list || [];
  } catch (e) {
    console.log("findGogoanimeEpsEr: ");
    return [];
  }
}
export async function findAnimeowlEps(page) {
  try {
    const episode_elem = "#subbed-pages-2 > div > a";
    const ep_link_list = await findAttributeContent(page, episode_elem, "href");
    const epList = ep_link_list.map((el, index) => {
      return {
        ep_num: index + 1,
        ep_link: el,
      };
    });
    return epList || [];
  } catch (e) {
    console.log("findAnimeowlEps_Er: " + e);
    return [];
  }
}
export async function findZoroEps(zoroBestResult) {
  const baseURL = "https://zoro.to/ajax/v2/episode/list";
  if (!zoroBestResult) return [];
  const animeId = zoroBestResult.split("-").pop();
  const html = (await axios.get(`${baseURL}/${animeId}`)).data.html;
  const $ = load(html);
  let epList = [];
  $("a.ssl-item.ep-item").each((i, el) => {
    const epId = $(el).attr("data-id");
    const epNum = i + 1;
    epList.push({
      epId,
      epNum,
    });
  });
  return epList;
}
