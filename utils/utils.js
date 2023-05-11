import * as getPlayer from "../src/video/getPlayer.js";
// import * as pup from "../config/puppeteer-config.js";
import { createPages } from "../config/puppeteer.js";
const {
  page,
  page_vuianime,
  page_animet,
  page_hpanda,
  page_anime47,
  page_animefull,
  page_xemanime,
  page_animetvn,
  page_yugen,
  page_gogo,
  page_animeowl,
  page_gogoanime_dub,
  page_allanime_dub,
  page_allanime,
} = await createPages();

export const delay = async (second) => {
  return new Promise((resolve) => {
    setTimeout(resolve, second);
  });
};

export async function findAttributeContent(
  page,
  elem,
  attribute,
  is_$$eval = true
) {
  let content;
  try {
    await page.waitForSelector(elem, { timeout: 15000 });
    if (is_$$eval) {
      content = page.$$eval(
        elem,
        (data, attribute) => {
          return data.map((el) => el.getAttribute(attribute) || "");
        },
        attribute
      );
    } else {
      content = page.$eval(
        elem,
        (data, attribute) => {
          return data.getAttribute(attribute) || "";
        },
        attribute
      );
    }
  } catch (e) {
    console.log("find_atribute_content_e: " + e);
  } finally {
    return content;
  }
}

export async function findTextContent(page, elem, is_$$eval = true) {
  let content;
  try {
    await page.waitForSelector(elem, { timeout: 15000 });
    if (is_$$eval) {
      content = page.$$eval(elem, (data) => {
        return data.map(
          (el) =>
            el.textContent
              .replace(/\n/g, "")
              .replace(/\([^\d]*(\d+)]*\)/g, "")
              .trim() || ""
        ); ///\([^\d]*(\d+)]*\)/g remove all numbers in parenthesis. ex: (2021)
      });
    } else {
      content = page.$eval(elem, (data) => {
        return (
          data.textContent
            .replace(/\n/g, "")
            .replace(/\([^\d]*(\d+)]*\)/g, "")
            .trim() || ""
        ); ///\([^\d]*(\d+)]*\)/g remove all numbers in parenthesis. ex: (2021)
      });
    }
  } catch (e) {
    console.log("findTextContent_er: " + e);
  } finally {
    return content;
  }
}

export const getVideoFromNetWorksTab = async (page, ep_watching) => {
  if (!ep_watching) return "";
  const getVideo = async (page, isReloaded) => {
    let video = "";
    // await delay(6000);
    page.on("request", async (request) => {
      if (
        request.url().endsWith("m3u8") ||
        request.url().includes("femax") ||
        request.url().includes("fembed")
      ) {
        video = request.url();
      }
    });
    if (isReloaded) {
      await page.reload({ waitUntil: "networkidle2", timeout: 10000 });
    } else {
      await page.goto(ep_watching, {
        waitUntil: "networkidle2",
        timeout: 10000,
      });
    }
    return video || "";
  };
  let video;
  try {
    video = await getVideo(page, false);
    if (!video) {
      video = await getVideo(page, true);
    }
  } catch (e) {
    console.log("getVideoFromNetWorksTab_player_er: " + e);
    video = await getVideo(page, true);
  } finally {
    return video || "";
  }
};

export function findSearchTitle(title) {
  // const isMovie = search_title.toLowerCase().search("movie");
  // const isSeason = search_title.toLowerCase().search("season");
  // const isPart = title.toLowerCase().search("part");
  // const isFilm = search_title.toLowerCase().search("film");
  // const isColon = title.toLowerCase().search(":")
  // if (isMovie !== -1) search_title = search_title.slice(0, isMovie - 1);
  // else if (isColon !== -1) search_title = search_title.slice(0, isColon -1);
  // else if (isSeason !== -1) search_title = search_title.slice(0, isSeason - 1);
  // else if (isPart !== -1) search_title = findPartAnime(title)
  // else if (isFilm !== -1) search_title = search_title.slice(0, isFilm - 1);
  // console.log("search_title: " + search_title)
  // return search_title
  if (title.split(" ").length > 1) {
    return title.split(" ").slice(0, 2).join(" ");
  } else {
    return title.split(" ")[0]; // Ex: title = Sono Bisque Doll wa Koi wo Suru => search_title = Sono
  }
}
export function isPartAnime(title) {
  const partPosition = title.toLowerCase().search("part");
  if (partPosition === -1) return false;
  const isPartNumber = title[partPosition + 5];
  console.log("isPartNumber: " + isPartNumber);
  if (!isNaN(Number(isPartNumber))) {
    return true;
  }
}
//This function removes season, movie, and part from the original title
//ex: spuy x faimly part 2  => spy x family
export function getRootName(original_title) {
  //Many cases such as: season 2, final season, s2, ss2, ...
  let finalTitle = findConditionName(original_title, false); //This turns those cases into from of Season ${number}
  const seasonPosition = finalTitle.toLowerCase().search("season");
  if (seasonPosition !== 1) {
    const isFinalSeason = finalTitle.toLowerCase().includes("final season");
    if (isFinalSeason) {
      finalTitle = finalTitle.toLowerCase().replace("final season", "");
    } else {
      finalTitle = finalTitle.slice(0, seasonPosition - 1);
    }
  }

  const partPosition = finalTitle.toLowerCase().search("part");
  if (partPosition !== -1) {
    const isPartNumber = !isNaN(Number(finalTitle[partPosition + 5]));
    if (isPartNumber) {
      finalTitle = finalTitle.slice(0, partPosition - 1);
    }
  }
  const moviePosition = finalTitle.toLowerCase().search("movie");
  if (moviePosition !== -1) {
    finalTitle = finalTitle.slice(0, moviePosition - 1);
  }
  return finalTitle;
}

export function findPartAnime(title) {
  const part_position = title.toLowerCase().search("part");
  const isSeason = title.toLowerCase().includes("season");
  const isMovie = title.toLowerCase().includes("movie");
  const isFilm = title.toLowerCase().includes("film");
  let condition_query_part_anime = title;
  if (part_position !== -1 && !isSeason && !isMovie && !isFilm) {
    const isPartNumber = title[part_position + 5];
    if (isPartNumber !== " " && !isNaN(Number(isPartNumber))) {
      condition_query_part_anime = title
        .toLowerCase()
        .replace(`part ${isPartNumber}`, `season ${isPartNumber}`);
    }
  }
  return condition_query_part_anime;
}

export function findConditionName(title, checkPart = true) {
  let final_title = title
    .replace(" II", " season 2")
    .replace(" II ", " season 2")
    .replace(" III", " season 3")
    .replace(" III ", " season 3")
    .replace(" IV", " season 4")
    .replace(" IV ", " season 4")
    .replace(/\([^\d]*(\d+)]*\)/g, "") // remove all numbers in parenthesis
    .toLowerCase()
    .replace(/ - /g, " ") // ex: bleach - movie 1 => bleach movie 1
    .replace(/-/g, " ") // turn every "-" into space (" ")
    .replace("hồi ký vanitas", "vanitas no carte")
    .replace("hồi kí vanitas", "vanitas no carte")
    .replace("hoi ky vanitas", "vanitas no carte")
    .replace("the movie", "movie")
    // .replace("attack on titan", "shingeki no kyojin")
    .replace("shingeki no kyojin attack on titan", "shingeki no kyojin")
    .replace("vanitas no karte", "vanitas no carte")
    .replace("tv", "")
    .replace(".", "")
    .replace("ß", "ss")
    .replace("v1", "")
    .replace("ss1", "")
    .replace("s1", "")
    .replace("s2", "season 2")
    .replace("s3", "season 3")
    .replace("s4", "season 4")
    .replace("s5", "season 5")
    .replace("s6", "season 6")
    .replace("s7", "season 7")
    .replace("s8", "season 8")
    .replace("ss2", "season 2")
    .replace("ss3", "season 3")
    .replace("ss4", "season 4")
    .replace("ss5", "season 5")
    .replace("ss6", "season 6")
    .replace("ss7", "season 7")
    .replace("ss8", "season 8")
    .replace("2nd season", "season 2")
    .replace("3rd season", "season 3")
    .replace("4th season", "season 4")
    .replace("5th season", "season 5")
    .replace("6th season", "season 6")
    .replace("7th season", "season 7")
    .replace("8th season", "season 8")
    .replace("the final season", "final season")
    .replace("2nd attack", "season 2")
    .replace("3rd attack", "season 3")
    .trim();
  if (checkPart) final_title = findPartAnime(final_title); //this turn part into season. ex: spy x family part 2 => spy x family season 2
  if (
    !isNaN(Number(final_title[final_title.length - 1])) &&
    !final_title.toLowerCase().includes("season") &&
    !final_title.toLowerCase().includes("movie") &&
    !final_title.toLowerCase().includes("part") &&
    final_title.split(" ").length > 3 &&
    final_title.toLowerCase() !== "86"
  ) {
    const seasonNumber = final_title[final_title.length - 1];
    final_title = final_title.replace(
      final_title[final_title.length - 1],
      `season ${seasonNumber}`
    );
  }
  return final_title.includes("fate/")
    ? final_title
    : final_title.replace(/[^a-zA-Z0-9 ]/g, "");
}

export async function findTitleAndLinkList(
  page,
  site_address,
  title_option,
  link_elem,
  episode_elem = null,
  backup_site_adress = null,
  title_backup_option = null,
  backup_site_address2 = null
) {
  const find_response = async (site_address) => {
    try {
      try {
        await page.goto(site_address, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
      } catch (error) {
        throw new Error(`Error navigating to page: ${error}`);
      }
      await page.waitForSelector(title_option.title_elem, { timeout: 15000 });
      // if (page.url().replace(/%20/g, " ").replace(/%3A/g, " ").replace(/%20/g, " ") !== site_address) throw new Error("No results")
      const find_title_list_model = async (title_option) => {
        if (!title_option) {
          return [];
        }
        try {
          const title_list = await page.$$eval(
            title_option.title_elem,
            (data, title_option) => {
              let originalTitleList;
              switch (title_option.title_attribute) {
                case "textContent":
                  originalTitleList = data.map((el) => el.textContent);
                  break;
                default:
                  originalTitleList = data.map((el) =>
                    el.getAttribute(title_option.title_attribute)
                  );
                  break;
              }
              let finalTitleList = originalTitleList.map((ele) => {
                return ele
                  .replace("Attack on Titan", "Shingeki no Kyojin")
                  .replace(/\([^()]*\d+[^()]*\)/g, "") ///\([^\d]*(\d+)]*\)/g only replace number between parenthesis. Example: naruto (2002) => naruto, but naruto (dub) => naruto (dub)
                  .trim();
              });
              const splitTitle = (titleList, seperator) => {
                const finalTitleList = titleList.map((el) => {
                  if (el && typeof el === "string") {
                    return el.split(seperator);
                  } else if (typeof el === "object") {
                    return el.map((el) => el.split(seperator)).flat();
                  } else {
                    return el;
                  }
                });
                return finalTitleList;
              };
              const seperators = title_option.seperators;
              if (seperators && seperators.length > 0) {
                for (let i = 0; i < seperators.length; i++) {
                  finalTitleList = splitTitle(finalTitleList, seperators[i]);
                }
              } else {
                finalTitleList = splitTitle(finalTitleList, null);
              }
              return finalTitleList || [];
            },
            title_option
          );
          return title_list;
        } catch (e) {
          console.log("findTitleAndLinkList-find_title_list_model_er: " + e);
          return [];
        }
      };

      // const find_title_list = page.$$eval(
      //   title_option.title_elem,
      //   (data, title_list_seperator_element) => {
      //     return (
      //       data.map((el) =>
      //         el.textContent
      //           .replace("Attack on Titan", "Shingeki no Kyojin")
      //           .replace(/\([^\d]*(\d+)]*\)/g, "")
      //           .trim()
      //           .split(title_list_seperator_element)
      //       ) || []
      //     );
      //   },
      //   title_list_seperator_element
      // ); ///^.*?\([^\d]*(\d+)[^\d]*\).*$/ only replace number between parenthesis. Example: naruto (2002) => naruto, but naruto (dub) => naruto (dub)
      const find_link_list = page.$$eval(
        link_elem,
        (data) => data.map((el) => el.href) || []
      );
      const find_total_eps =
        episode_elem &&
        page.$$eval(
          episode_elem,
          (data) =>
            data.map((el) =>
              el.textContent
                .split("/")
                .pop()
                .toLowerCase()
                .replace("hoàn tất", 1)
                .replace("tập", "")
                .replace("ep", "")
                .replace("episode", "")
                .replace("đang cập nhật", 1)
                .replace("vietsub", "")
                .trim()
            ) || []
        );

      const response = await Promise.allSettled([
        find_title_list_model(title_option),
        find_title_list_model(title_backup_option),
        find_link_list,
        find_total_eps,
      ]);
      return response;
    } catch (e) {
      console.log("site_address: " + site_address);
      console.log("findTitleAndLinkList_find_reponseEr: " + e);
      return [{ value: [] }];
    }
  };
  const add_items_to_title_and_link_list = (response) => {
    try {
      let title_and_link_list = [];
      const title_list = response[0].value;
      const title_backup_list = response[1].value;
      const link_list = response[2].value;
      const total_eps = episode_elem && response[3].value;
      for (let i = 0; i < title_list.length; i++) {
        title_and_link_list.push({
          title_list:
            title_backup_list && title_backup_list[i]
              ? title_list[i].concat(title_backup_list[i])
              : title_list[i],
          link: link_list[i],
          total_eps: total_eps && total_eps[i],
        });
      }
      return title_and_link_list;
    } catch (e) {
      console.log("add_items_to_title_and_link_listEr: " + e);
      return [];
    }
  };
  try {
    let title_and_link_list = [];
    const listOfURLs = [site_address, backup_site_adress, backup_site_address2];
    for (let searchURL of listOfURLs) {
      let response = await find_response(searchURL);
      if (
        response &&
        response[0] &&
        response[0].value &&
        response[0].value.length > 0
      ) {
        title_and_link_list = add_items_to_title_and_link_list(response);
        break;
      }
    }
    return title_and_link_list || [];
  } catch (e) {
    console.log("findTitleAndLinkListEr: " + e);
    return [];
  }
}

export function findBestTitleByMatchPercentage(
  title_and_link_list,
  condition_query,
  condition_query_split,
  condition_query_part_anime
) {
  try {
    let best_result;
    let title_match_percentage;
    let shortest_title_length = 0;
    let max = 0;
    let isPartAnime = false; //This will be true if part 2 of the anime is merged into part 1. for example: spy x family part 2 isn't a serapate anime, but merged into part 1 and become just only spy x family
    //ex: condition_query is Bleach or Naruto Shippuuden => we have to find the title that exactly match
    if (condition_query_split.length <= 2) {
      const new_tile_and_link_list = title_and_link_list.find((el) => {
        let matchedAnime;
        for (let title of el.title_list) {
          const condition_title = findConditionName(title);

          if (
            condition_title === condition_query ||
            condition_title === condition_query + " dub"
          ) {
            matchedAnime = el;
            break;
          }
        }
        return matchedAnime || "";
      });
      best_result = new_tile_and_link_list?.link || null;
    } else {
      let bestResultFoundFlag = false;
      const get_the_closet_matched_title = (el, title) => {
        let match_point = 0;
        const isSeason = condition_query.toLowerCase().includes("season");
        const condition_title = findConditionName(title);
        //If query anime is a season anime, the best result has to be a season anime
        //else skip it
        if (isSeason && !condition_title.toLowerCase().includes("season")) {
          return;
        }
        const condition_title_split = condition_title.split(" ");
        if (condition_query === condition_title) {
          best_result = el.link;
          max = 1;
          bestResultFoundFlag = true;
          return;
        } else {
          for (let i of condition_query_split) {
            if (condition_title.includes(i)) {
              match_point++;
            }
          }
          const title_length = condition_title_split.length;
          title_match_percentage = match_point / condition_query_split.length;
          if (max < title_match_percentage && title_match_percentage >= 0.73) {
            best_result = el.link;
            max = title_match_percentage;
            shortest_title_length = title_length;
          } else if (
            max === title_match_percentage &&
            title_match_percentage >= 0.75
          ) {
            if (title_length <= shortest_title_length) {
              best_result = el.link;
              shortest_title_length = title_length;
            }
          }
        }
      };
      for (let ele of title_and_link_list) {
        const breakFlag = bestResultFoundFlag;
        if (breakFlag) {
          break;
        }
        for (let title of ele.title_list) {
          get_the_closet_matched_title(ele, title);
          if (bestResultFoundFlag) break;
        }
      }
    }
    if (!best_result && condition_query_part_anime) {
      for (let ele of title_and_link_list) {
        if (Number(ele.total_eps) > 12) {
          for (let el of ele.title_list) {
            const condition_title_part_anime = getRootName(el);
            if (condition_query_part_anime === condition_title_part_anime) {
              best_result = ele.link;
              isPartAnime = true;
              break;
            }
          }
        }
      }
    }
    return best_result
      ? {
          best_result,
          isPartAnime,
        }
      : null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function findBestTitleInArray(
  title_and_link_list,
  title,
  title_english = null
) {
  if (!title_and_link_list || title_and_link_list.length === 0) {
    return null;
  }
  let result;
  const moviePosition = title.toLowerCase().search("movie");

  const find_best_result = (condition_query) => {
    const condition_query_split = condition_query.split(" ");
    const condition_query_part_anime = getRootName(title);
    const result = findBestTitleByMatchPercentage(
      title_and_link_list,
      condition_query,
      condition_query_split,
      condition_query_part_anime
    );

    if (moviePosition !== -1) {
      //If anime is a movie, must return a movie
      if (result && result.best_result.toLowerCase().includes("movie")) {
        return result;
      } else return null;
    } else {
      return result;
    }
  };
  //if title is a movie number, ex: bleach movie 1, bleach movie 4, .....
  let condition_query = findConditionName(title);
  if (moviePosition !== 1) {
    const isMovieNumber = title[moviePosition + 6];
    if (isMovieNumber !== " " && !isNaN(Number(isMovieNumber))) {
      condition_query = findTitleMovieNumber(title);
    }
  }
  result = find_best_result(condition_query);
  if (!result && title_english) {
    const condition_query_english = findConditionName(title_english);
    console.log("condition_query_english: " + condition_query_english);
    result = find_best_result(condition_query_english);
  }
  return result;
}

export function findTitleMovieNumber(title) {
  const isMovie = title.toLowerCase().search("movie");
  let title_movie_number = title.toLowerCase();
  if (isMovie !== -1) {
    const isMovieNumber = title[isMovie + 6];
    if (isMovieNumber !== " " && !isNaN(Number(isMovieNumber))) {
      title_movie_number = title_movie_number.slice(0, isMovie + 7);
    }
  }
  return title_movie_number;
}

export async function byPassSecurity(page, link) {
  while (page.url() === "https://anime47.com/xac-nhan.html") {
    try {
      page.once("dialog", async (dialog) => {
        if (dialog != null) {
          await dialog.dismiss();
        }
      });
      await page.evaluate(() => {
        const input1 = document.querySelector("#muoi");
        const input2 = document.querySelector("#tu");
        const input3 = document.querySelector("#bonbay");
        const input4 = document.querySelector("#tay");
        input1.value = "20";
        input2.value = "4";
        input3.value = "47";
        input4.value = "5";
        const submit = document.querySelector("#xacnhan");
        submit.click();
      });
      await delay(2000);
      await page.goto(link, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
    } catch (e) {
      console.log("byPassSecurityEr: " + e);
      break;
    }
  }

  return;
}
export async function getEpisodeFullDetails(
  promise_player_list,
  isEngSubOrVietSub,
  list_of_episodes_with_title,
  english_episode_details = null
) {
  let episode_full_details;
  try {
    let final_player_list = {};
    let episode_details = [];

    //Checking if english_episode_details or list_of_episodes_with_title[isEngSubOrVietSub] has more info
    if (
      english_episode_details &&
      list_of_episodes_with_title &&
      list_of_episodes_with_title[isEngSubOrVietSub]
    ) {
      if (
        english_episode_details.length >
        list_of_episodes_with_title[isEngSubOrVietSub].length
      ) {
        episode_details = english_episode_details;
      } else {
        episode_details = list_of_episodes_with_title[isEngSubOrVietSub];
      }
    } else if (
      list_of_episodes_with_title &&
      list_of_episodes_with_title[isEngSubOrVietSub]
    ) {
      episode_details = list_of_episodes_with_title[isEngSubOrVietSub];
    } else if (english_episode_details) {
      episode_details = english_episode_details;
    }
    const anime_results = await Promise.allSettled(promise_player_list);

    for (let el of anime_results) {
      if (
        el.value &&
        el.value.player_list &&
        el.value.player_list.some((el) => el.video)
        //player_list looks like this player_list = [{video: "", type_video:"", ep_num: ""}]
        // => Checking if the video in player_list is "" , if so, we will not add it to the final_player_list
      ) {
        const server_name = el.value.server_name;
        final_player_list[server_name] = el.value.player_list;
      }
    }
    episode_full_details = {
      episode_details,
      final_player_list,
    };
  } catch (e) {
    console.log(
      `${
        isEngSubOrVietSub === "vietSub"
          ? "getPlayerVietSubEr"
          : "getPlayerEngSubEr"
      }` + e
    );
  } finally {
    return episode_full_details;
  }
}
export async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
export async function getPlayerFromSites(serverName, epId, epNum) {
  let result = {};
  try {
    switch (serverName) {
      case "animeaz":
        const animeazEpWatching = `https://animeaz.me/xem-anime/${epId}.html`;
        result = await getPlayer.getAnimeazPlayer(page, animeazEpWatching);
        break;
      case "vuianime":
        const vuianimeEpWatching = `https://vuianime.pro/${epId}.html`;
        result = await getPlayer.getVuiAnimePlayer(
          page_vuianime,
          vuianimeEpWatching
        );
        break;
      case "animet":
        const animetEpWatching = `https://animet.net/${epId}.html`;
        result = await getPlayer.getAnimetPlayer(page_animet, animetEpWatching);
        break;
      case "anime47":
        const anime47EpWatching = `https://anime47.com/${epId}.html`;
        result = await getPlayer.getAnime47Player(
          page_anime47,
          anime47EpWatching
        );
        break;
      case "animefull":
        const animefullEpWatching = `https://animefull2.org/xem-phim/${epId}.html`;
        result = await getPlayer.getAnimefullPlayer(
          page_animefull,
          animefullEpWatching
        );
        break;
      case "hpanda":
        const hpandaEpWatching = `https://hhpanda.tv/${epId}.html`;
        result = await getPlayer.getHpandaPlayer(page_hpanda, hpandaEpWatching);
        break;
      case "xemanime":
        const xemanimeEpWatching = `https://xemanime.net/xem-phim/${epId}.html`;
        result = await getPlayer.getXemanimePlayer(
          page_xemanime,
          xemanimeEpWatching
        );
        break;
      case "animetvn":
        const animetvnEpWatching = `https://animetvn.xyz/xem-phim/${epId}.html`;
        result = await getPlayer.getAnimetvnPlayer(
          page_animetvn,
          animetvnEpWatching
        );
        break;
      case "yugen":
        const yugenEpWatching = `https://yugen.to/watch/${epId}`;
        result = await getPlayer.getYugenPlayer(page_yugen, yugenEpWatching);
        break;
      case "allanime":
        const allanimeEpWatching = `https://allanime.to/watch/${epId}`;
        result = await getPlayer.getAllanimePlayer(
          page_allanime,
          allanimeEpWatching
        );
        break;
      case "gogoanime":
        const gogoanimeEpWatching = `https://gogoanime.tel/${epId}`;
        result = await getPlayer.getGogoanimePlayer(
          page_gogo,
          gogoanimeEpWatching
        );
        break;
      case "allanimeDub":
        const allanimeEpWatchingDub = `https://allanime.to/watch/${epId}`;
        result = await getPlayer.getAllanimePlayer(
          page_allanime_dub,
          allanimeEpWatchingDub,
          true
        );
        break;
      case "gogoanimeDub":
        const gogoanimeEpWatchingDub = `https://gogoanime.tel/${epId}`;
        result = await getPlayer.getGogoanimePlayer(
          page_gogoanime_dub,
          gogoanimeEpWatchingDub,
          true
        );
        break;
      case "animeowl":
        const animeowlEpWatching = `https://portablegaming.co/watch/${epId}`;
        result = await getPlayer.getAnimeowlPlayer(
          page_animeowl,
          animeowlEpWatching
        );
        break;
    }
  } catch (e) {
    console.log(`getPlayerFromSitesEr: ` + e);
    result["video"] = "";
    result["type_video"] = "";
  } finally {
    result["ep_num"] = epNum;
    result["episodeId"] = epId;
    return result;
  }
}

export const getLocalDateString = (days) => {
  const today = new Date();
  const date = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return formattedDate;
};
