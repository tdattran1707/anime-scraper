import { findSearchModel } from "./models/findSearchModel.js";
import {
  findBestTitleInArray,
  findSearchTitle,
  byPassSecurity,
  findTitleAndLinkList,
} from "../../utils/utils.js";

export const findBestAnimeazResult = async (
  page,
  title_synonym,
  title_english
) => {
  let search_title = findSearchTitle(title_synonym);
  const site_address = `https://animeaz.me/?q=${search_title}`;
  const backup_search_title = title_english
    ? findSearchTitle(title_english)
    : search_title;
  const backup_site_address = `https://animeaz.me/?q=${backup_search_title}`;
  const backup_search_title2 = title_synonym.split(" ")[0];
  const backup_site_address2 = `https://animeaz.me/?q=${backup_search_title2}`;
  const findBackupBestResult = async () => {
    try {
      const listOfURLs = [
        site_address,
        backup_site_address,
        backup_site_address2,
      ];
      const findBackupTitleAndLinkList = async (site_address) => {
        try {
          await page.goto(site_address, {
            waitUntil: "domcontentloaded",
            timeout: 20000,
          });
          await page.waitForSelector(
            "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div.gsc-resultsRoot.gsc-tabData.gsc-tabdActive > div > div.gsc-expansionArea > div > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a",
            { waitUntil: "domcontentloaded", timeout: 20000 }
          );
          const title_and_link_list = await page.$$eval(
            "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div.gsc-resultsRoot.gsc-tabData.gsc-tabdActive > div > div.gsc-expansionArea > div > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a",
            (data) => {
              return data.map((el) => {
                return {
                  link: el.getAttribute("data-ctorig"),
                  title_list: [el.textContent.replace(" VietSub HD", "")],
                  total_eps: null,
                };
              });
            }
          );
          return title_and_link_list;
        } catch (e) {
          console.log("findBackupTitleAndLinkListEr: " + e);
          return [];
        }
      };
      let best_result;
      for (let site_address of listOfURLs) {
        const title_and_link_list = await findBackupTitleAndLinkList(
          site_address
        );
        console.log("animeaz_title_and_link_list:");
        console.log(title_and_link_list);
        if (!title_and_link_list || title_and_link_list.length === 0) {
          continue;
        }
        best_result = findBestTitleInArray(title_and_link_list, title_synonym);
        if (best_result) break;
      }
      return best_result || null;
    } catch (e) {
      console.log("findAnimeazBackupBestResultEr: " + e);
      return null;
    }
  };

  try {
    const title_elem = "a.main__app--item-link";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const link_elem = "a.main__app--item-link";
    const episode_elem = "div.main__app--item-status.brand__item--minity.red";
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
    let best_result = await findSearchModel(searchOpts);
    if (!best_result) {
      best_result = await findBackupBestResult();
    }
    return best_result || null;
  } catch (e) {
    console.log("findBestAnimeazResult: " + e);
    return null;
  }
};
export const findBestAnimetResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://animet.net/tim-kiem/${search_title}.html`;
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_site_address = `https://animet.net/tim-kiem/${backup_search_title}.html`;

    const backup_search_title2 = title_synonym.split(" ")[0];
    const backup_site_address2 = `https://animet.net/tim-kiem/${backup_search_title2}.html`;
    const title_elem =
      "#Tp-Wp > div.Body.Container > div > div.TpRwCont > main > section > ul > li > article > a > h2";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const link_elem =
      "#Tp-Wp > div.Body.Container > div > div.TpRwCont > main > section > ul > li > article > a";
    const episode_elem =
      "#Tp-Wp > div.Body.Container > div > div.TpRwCont > main > section > ul > li > article > a > div > span.mli-eps > i";
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
    console.log("findBestAnimetResultEr: " + e);
    return null;
  }
};
export const findBestVuianimeResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    let search_title = findSearchTitle(title_synonym);
    const site_address = `https://vuianime.pro/tim-kiem/${search_title}.html`;
    let backup_search_title = title_synonym.split(" ")[0];
    const backup_site_address = `https://vuianime.pro/tim-kiem/${backup_search_title}.html`;
    const backup_search_title2 = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_site_address2 = `https://vuianime.pro/tim-kiem/${backup_search_title2}.html`;
    const link_elem = "li.film-item > a";
    const title_elem =
      "#page-info > div.block-film > ul > li > a > div > p.real-name";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: ["|", "-"],
    };
    const title_backup_elem =
      "#page-info > div.block-film > ul > li > a > div > p.name";
    const title_backup_option = {
      title_elem: title_backup_elem,
      title_attribute: "textContent",
      seperators: ["|", "-"],
    };
    const episode_elem = "#page-info > div.block-film > ul > li > label";
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
    console.log("findBestVuianimeResultEr: " + e);
    return null;
  }
};
export const findBestHpandaResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://hhpanda.tv/search?q=${search_title}&submit=`;
    const backup_search_title = title_synonym.split(" ")[0];
    const backup_site_address = `https://hhpanda.tv/search?q=${backup_search_title}&submit=`;
    const backup_search_title2 = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_site_address2 = `https://hhpanda.tv/search?q=${backup_search_title2}&submit=`;
    const title_elem = "h4.title > a";
    const title_option = {
      title_elem,
      title_attribute: "title",
      seperators: ["|", ","],
    };
    const title_backup_elem = "p.text.text-overflow.text-muted.hidden-xs";
    const title_backup_option = {
      title_backup_elem,
      title_attribute: "textContent",
      seperators: ["|", ","],
    };
    const link_elem = "a.myui-vodlist__thumb";
    const episode_elem = "span.pic-tag.pic-tag-top";
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
    console.log("findBestHpandaResultEr: " + e);
    return null;
  }
};
export const findBestAnime47Result = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://anime47.com/tim-nang-cao/?keyword=${search_title.replace(
      /\s+/g,
      "+"
    )}&nam=&season=&status=&sapxep=1`;
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_site_address = `https://anime47.com/tim-nang-cao/?keyword=${backup_search_title.replace(
      /\s+/g,
      "+"
    )}&nam=&season=&status=&sapxep=1`;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const backup_site_address2 = `https://anime47.com/tim-nang-cao/?keyword=${backup_search_title2.replace(
      /\s+/g,
      "+"
    )}&nam=&season=&status=&sapxep=1`;
    const listOfSearchUrls = [
      site_address,
      backup_site_address,
      backup_site_address2,
    ];
    const findAnime47TitleAndLinkList = async (site_address) => {
      let title_and_link_list = [];
      try {
        const title_elem = "ul.last-film-box > li> a";
        const link_elem = "ul.last-film-box > li > a";
        const episode_elem =
          "ul.last-film-box > li > a > div > div.movie-meta > span.ribbon";
        await page.goto(site_address, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        const security_question = await page.$("input#muoi");
        if (security_question) await byPassSecurity(page, site_address);
        await Promise.allSettled([
          page.waitForSelector(title_elem, { timeout: 20000 }),
          page.waitForSelector(link_elem, { timeout: 20000 }),
        ]);
        if (page.url().replace(/%20/g, " ") !== site_address)
          throw new Error("No results");
        const find_title_list = page.$$eval(title_elem, (data) => {
          return data.map((el) => {
            let final_arr = [];
            const arr = el
              .getAttribute("title")
              .replace(/\(([^)]+)\)/, "")
              .trim()
              .split("|");
            for (let el of arr) {
              final_arr.push(
                ...el.split(" -  ").map((el) => el.replace(/-/g, " ").trim())
              );
            }
            return final_arr;
          });
        });
        const find_link_list = page.$$eval(link_elem, (data) =>
          data.map((el) => el.href)
        );
        const find_total_eps = page.$$eval(episode_elem, (data) =>
          data.map((el) =>
            el.textContent
              .split("/")
              .pop()
              .replace("Hoàn tất", 1)
              .replace("Tập ", "")
          )
        );
        const response = await Promise.all([
          find_title_list,
          find_link_list,
          find_total_eps,
        ]);
        const title_list = response[0];
        const link_list = response[1];
        const total_eps = response[2];

        if (title_list && title_list.length > 0) {
          for (let i = 0; i < title_list.length; i++) {
            title_and_link_list.push({
              title_list: title_list[i],
              link: link_list[i],
              total_eps: total_eps[i],
            });
          }
        }
      } catch (e) {
        console.log(`findAnime47TitleAndLinkListEr: ` + e);
      } finally {
        return title_and_link_list;
      }
    };
    let title_and_link_list = [];
    for (let site_address of listOfSearchUrls) {
      title_and_link_list = await findAnime47TitleAndLinkList(site_address);
      if (title_and_link_list && title_and_link_list.length > 0) {
        break;
      }
    }

    if (!title_and_link_list || title_and_link_list.length === 0) {
      return null;
    }
    const anime47_result = findBestTitleInArray(
      title_and_link_list,
      title_synonym,
      title_english
    );
    return anime47_result || null;
  } catch (e) {
    console.log("findBestANime47ResultEr: " + e);
    return null;
  }
};
export const findBestAnimeFullResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const site_address = `https://animefull1.net/tim-kiem/?q=${search_title}`;
    const backup_search_title = title_synonym.split(" ")[0];
    const backup_site_address = `https://animefull1.net/tim-kiem/?q=${backup_search_title}`;
    const backup_search_title2 = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_site_address2 = `https://animefull1.net/tim-kiem/?q=${backup_search_title2}`;
    const listOfSearchUrls = [
      site_address,
      backup_site_address,
      backup_site_address2,
    ];

    console.log(listOfSearchUrls);
    const findAnimefullTitleAndLinkList = async (site_address) => {
      let title_and_link_list = [];
      try {
        await page.goto(site_address, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        const title_elem =
          "#content > div > div.left-content > div.block-film > ul > li > div > a > div.title > p.name";
        const real_name_title_elem = "div.title > p.real-name";
        const link_elem = "ul.list-film > li > div.film-k > a";
        const episode_elem = "label.current-status";
        await Promise.allSettled([
          page.waitForSelector(title_elem, { timeout: 20000 }),
          page.waitForSelector(real_name_title_elem, { timeout: 20000 }),
          page.waitForSelector(link_elem, { timeout: 20000 }),
          page.waitForSelector(episode_elem, { timeout: 20000 }),
        ]);
        async function find_content(element, isLink = false) {
          return new Promise(async (resolve) => {
            const content = await page.$$eval(
              element,
              (data, isLink) => {
                return data.map((el) =>
                  isLink
                    ? el.href
                    : el.textContent.replace(/\([^\d]*(\d+)]*\)/g, "").trim()
                );
              },
              isLink
            );
            resolve(content);
          });
        }
        const result = await Promise.allSettled([
          find_content(title_elem),
          find_content(real_name_title_elem),
          find_content(link_elem, true),
          find_content(episode_elem),
        ]);

        const title_list = result[0].value;
        const real_name_title_list = result[1].value;
        const link_list = result[2].value;
        const episode_list = result[3].value;
        if (title_list) {
          for (let i = 0; i < title_list.length; i++) {
            title_and_link_list.push({
              title_list: [real_name_title_list[i], title_list[i]],
              link: link_list[i],
              total_eps:
                episode_list[i] === "Hoàn tất"
                  ? "1"
                  : episode_list[i].split("/").pop().replace("Tập", "").trim(),
            });
          }
        } else {
          return [];
        }
      } catch (e) {
        console.log("findAnimefullTitleAndLinkListEr: " + e);
      } finally {
        return title_and_link_list;
      }
    };
    let title_and_link_list = [];
    for (let site_address of listOfSearchUrls) {
      title_and_link_list = await findAnimefullTitleAndLinkList(site_address);
      if (title_and_link_list && title_and_link_list.length > 0) {
        break;
      }
    }

    if (!title_and_link_list || title_and_link_list.length === 0) {
      return null;
    }
    const best_result = findBestTitleInArray(
      title_and_link_list,
      title_synonym,
      title_english
    );
    return best_result || mill;
  } catch (e) {
    console.log("findBestAnimefullResultEr: " + e);
    return null;
  }
};
export const findBestXemanimeResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const site_address = `https://xemanime.net/tim-kiem/${search_title}.html`;
    const backup_site_address = `https://xemanime.net/tim-kiem/${backup_search_title}.html`;
    const backup_site_address2 = `https://xemanime.net/tim-kiem/${backup_search_title2}.html`;
    const title_elem = ".name-movie";
    const title_option = {
      title_elem,
      title_attribute: "textContent",
      seperators: [],
    };
    const link_elem = ".movie-item > a";
    const episode_elem = ".episode-latest > span";
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
    console.log("findBestXemanimeResultEr: " + e);
    return null;
  }
};
export const findBestAnimetvnResult = async (
  page,
  title_synonym,
  title_english
) => {
  try {
    const search_title = findSearchTitle(title_synonym);
    const backup_search_title = title_english
      ? findSearchTitle(title_english)
      : search_title;
    const backup_search_title2 = title_synonym.split(" ")[0];
    const site_address = `https://animetvn.info/tim-kiem/${search_title}.html`;
    const backup_site_address = `https://animetvn.info/tim-kiem/${backup_search_title}.html`;
    const backup_site_address2 = `https://animetvn.info/tim-kiem/${backup_search_title2}.html`;
    const title_elem = "h3.title > a";
    const title_option = {
      title_elem,
      title_attribute: "title",
      seperators: ["-", ","],
    };
    const title_backup_elem = "h3.title > a";
    const title_backup_option = {
      title_elem: title_backup_elem,
      title_attribute: "textContent",
      seperators: ["-", ","],
    };
    const link_elem = "h3.title > a";
    const episode_elem = ".mode > span.time";
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
    console.log("findBestAnimetvnResultEr: " + e);
    return null;
  }
};
