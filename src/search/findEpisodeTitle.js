import {
  findSearchTitle,
  findTitleAndLinkList,
  findBestTitleInArray,
  findPartAnime,
  findConditionName,
} from "../../utils/utils.js";
import axios from "axios";
import { ANIME } from "@consumet/extensions";
import cheerio from "cheerio";
import { findBestZoroResult } from "./findEngSubSearchResult.js";
export const findEpisodeTitle = async (
  id,
  page_vuighe,
  title,
  title_english,
  total_eps,
  img
) => {
  const findVietsubEpisodeTitle = async () => {
    const vuigheSearchTitle = findSearchTitle(title);
    const vuigheSearchTitleEnglish = title_english
      ? findSearchTitle(title_english)
      : vuigheSearchTitle;
    try {
      const seasonPosition = title.toLowerCase().search("season");
      const partPosition = title.toLowerCase().search("part");
      const isFinalSeason = title.toLowerCase().includes("final season"); //ex: Attack on titan final season part 2
      const find_best_vuighe_result = async () => {
        let vuighe_result;
        try {
          const title_elem =
            "body > div.container > section > div > div > a > div > div:nth-child(1)";
          const title_option = {
            title_elem,
            title_attribute: "textContent",
            seperators: [],
          };
          const link_elem = "body > div.container > section > div > div > a";
          const title_and_link_list = await findTitleAndLinkList(
            page_vuighe,
            `https://vuighe.net/tim-kiem/${vuigheSearchTitle}`,
            title_option,
            link_elem,
            null,
            `https://vuighe.net/tim-kiem/${vuigheSearchTitleEnglish}`,
            null,
            `https://vuighe.net/tim-kiem/${title.split(" ")[0]}`
          );

          console.log("vuighe_title_and_link_list: ");
          console.log(title_and_link_list);
          const findVuigheConditionTitle = (title) => {
            let final_title = title;
            if (seasonPosition !== -1) {
              if (isFinalSeason) {
                final_title = title
                  .toLowerCase()
                  .replace("the final season", "")
                  .replace("final season", "");
              } else {
                final_title = title.slice(0, seasonPosition - 1);
              }
            }
            if (partPosition !== -1) {
              const finalPartPosition = final_title
                .toLowerCase()
                .search("part");
              const partPositionNumber = final_title[finalPartPosition + 5];
              console.log("finalPartPosition: " + finalPartPosition);
              console.log("partPositionNumber: " + partPositionNumber);
              if (
                partPositionNumber !== " " &&
                !isNaN(Number(partPositionNumber))
              ) {
                console.log("final_title: " + final_title);
                final_title = final_title.slice(0, finalPartPosition - 1);
              }
            }
            return final_title;
          };
          const vuigheTitle = findVuigheConditionTitle(title);
          const vuigheTitleEnglish = findVuigheConditionTitle(title_english);
          console.log(vuigheTitle);
          console.log(vuigheTitleEnglish);
          if (title_and_link_list && title_and_link_list.length > 0) {
            vuighe_result = findBestTitleInArray(
              title_and_link_list,
              vuigheTitle,
              vuigheTitleEnglish
            );
          }
          console.log("vuighe_result: " + vuighe_result);
        } catch (e) {
          console.log("find_best_vuighe_result: " + e);
        } finally {
          return vuighe_result ? vuighe_result.best_result : null;
        }
      };
      const vuighe_best_result = await find_best_vuighe_result();
      console.log("vuighe_best_result: " + vuighe_best_result);
      if (vuighe_best_result) {
        let season;
        await page_vuighe.goto(vuighe_best_result, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        async function check_season() {
          try {
            let ideal_title = findConditionName(title, false);
            //There will be cases like Attack on titan season 2 part 3
            // Or Spy x family part 2
            // Check if the title is season => convert 2nd seaosn to season 2
            // If not, convert the part 2 to season 2
            console.log("ideal_title: " + ideal_title);
            if (seasonPosition === -1)
              ideal_title = ideal_title
                .replace("part 2", "season 2")
                .replace("part 3", "season 3");
            //Convert Boku no hero academia 2 to Boku no hero academia seson 2
            const last_word = ideal_title[ideal_title.length - 1]; //last word of the titl. ex: title is spy x family part 2 => last_word is 2
            const is_last_word_a_number = !isNaN(Number(last_word));
            if (is_last_word_a_number && !title.includes("86"))
              ideal_title.replace(last_word, `season ${last_word}`);

            await page_vuighe.waitForSelector("#season-active");
            //click on season button to show all seasons
            await page_vuighe.click("#season-active");
            let season_names_array;
            let episode_range_list;
            try {
              const seasonInfo = await Promise.all([
                //find_which_season. Ex: season 1, season 2 => season_names_array: [1,2]
                page_vuighe.$$eval("span.season-item-name", (data) => {
                  return data.map((ele) =>
                    ele.textContent.replace("Season ", "").replace(" -  ", "")
                  );
                }),
                //find range_list. Ex; 1-12 or 12-24, ....
                page_vuighe.$$eval("span.season-item-range", (data) => {
                  return data.map((ele) => ele.textContent);
                }),
              ]);
              season_names_array = seasonInfo[0];
              episode_range_list = seasonInfo[1];
            } catch (e) {
              console.log("This anime has only one season");
              season = 1;
            }
            console.log("season_names_array: " + season_names_array);
            console.log("episode_range_list: " + episode_range_list);
            console.log("season: " + season);
            let firstEp = 1;

            if (isFinalSeason) {
              const first_ep_position = 0; // if isfinalSeason => season will be the first item in the season_names_array array
              season = season_names_array[0];
              episode_range_list[first_ep_position].split("-").shift();
              firstEp =
                first_ep_position !== -1
                  ? episode_range_list[first_ep_position].split("-").shift()
                  : 1;
            } else {
              season =
                seasonPosition !== -1 ? ideal_title[seasonPosition + 7] : 1; //ex: boku no hero academia season 2 => season: 2
              firstEp = season_names_array.findIndex(
                (el) => el.toString() === season.toString()
              );
            }
            return firstEp;
          } catch (e) {
            console.log(e);
            return "1";
          }
        }
        const firstEp = await check_season();
        if (firstEp) {
          await page_vuighe.goto(`${vuighe_best_result}/tap-${firstEp}`, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
        }
        await page_vuighe.waitForSelector(".episode-item", {
          timeout: 7000,
        });
        let [ep_title, ep_image] = await Promise.all([
          page_vuighe.$$eval(".grow > div:nth-child(1)", (data) => {
            return data.map((el) => el.textContent);
          }),
          page_vuighe.$$eval(
            ".episode-item > a > div:nth-child(1) > img",
            (data) => data.map((el) => el.src)
          ),
        ]);
        if (ep_title) {
          ep_title = ep_title.filter((el) => el.includes("Tập"));
          //Remove ova episode from the arrays
          const ova_ep_position = ep_title.findIndex((el) =>
            el.includes("Tập đặc biệt")
          );
          if (ova_ep_position !== -1) {
            ep_title.splice(ova_ep_position, 1);
            ep_image.splice(ova_ep_position, 1);
          }

          let episode_list = ep_title.map((el, index) => {
            return {
              num: index + 1,
              title: el,
              img: ep_image[index],
            };
          });
          //Ex:  Attack on titan season 3 part 2
          //On vuighe site season 3 will be 24 eps
          //=> if Part 2 we just get 12 eps out of it.
          //Checking if the title is a part anime

          const vuighe_total_eps = ep_title.length;
          if (Number(total_eps) !== Number(vuighe_total_eps)) {
            //Here we have 2 cases: this anime is first part, or this anime is second part
            //Checking if this anime is first or second part
            let isPart = false;
            if (partPosition !== -1) {
              const is_part_number = title.toLowerCase()[partPosition + 5];
              if (!isNaN(Number(is_part_number))) isPart = true;
            }
            let is_part_in_season = false; //ex: attack on titan season 3 part 2
            if (seasonPosition !== -1 && isPart) is_part_in_season = true;
            //If this anime is second part
            if (is_part_in_season) {
              const totalEpsOfFirstPart =
                Number(vuighe_total_eps) - Number(total_eps);
              //Example: vuighe list 26 eps;
              //But part 2 only has 12 eps => part 1 has 14 eps
              // => first episode of part 2 is episode 15
              //but we need the position (index) of that ep in a list
              // => episode 15 is at index 14 in the list;
              const firstEpisode = totalEpsOfFirstPart;
              episode_list = episode_list.slice(firstEpisode);
            } else {
              //if this anime is first part
              episode_list = episode_list.slice(0, total_eps);
            }
          }
          // If season is not season 1 => season must be 2 or larger;
          // the lines below will change "Tap 12" to "Tap 1" and so on
          for (let i = 0; i < episode_list.length; i++) {
            const original_title = episode_list[i].title;
            const ep_name = original_title.split(" - ").shift().trim(); //ex: Tập 1
            const ep_number = ep_name.replace("Tập ", ""); //ex: 1
            if (!isNaN(Number(ep_number))) {
              episode_list[i].num = i + 1;
              episode_list[i].title = original_title.replace(
                `Tập ${ep_number}`,
                `Tập ${ep_number - (ep_number - 1) + i}`
              ); // ex: ep_number - ep_difference = 14 - 13 => 1
            }
          }

          return episode_list;
        }
      } else return [];
    } catch (e) {
      console.log("findVietsubEpisodeTitleEr: " + e);
      return [];
    }
  };
  const findEnglishEisodeTitle = async () => {
    try {
      const consumet_link = `https://api.consumet.org/anime/zoro`;
      const vercel_link = `https://api.consumet.org/anime/9anime`;
      const render_link = `https://api.consumet.org/anime/enime`;
      const apiLinkList = [consumet_link, vercel_link, render_link];
      const librarySiteList = ["zoro", "enime", "9anime"];
      const zoro = new ANIME.Zoro();
      const nineAnime = new ANIME.NineAnime();
      const enime = new ANIME.Enime();
      const findBestSearchResult = (searchList) => {
        if (!searchList || searchList.length == 0) {
          return "";
        }
        //Get 3 first results
        let array = searchList.slice(0, 3).map((el) => {
          return {
            link: el.id,
            title_list: [el.title],
          };
        });

        let best_result = findBestTitleInArray(array, title, title_english);
        const animeId = best_result?.best_result || null;
        return animeId;
      };
      const findEpTitleThruAPI = async () => {
        try {
          let episodeTitleList = [];
          const findEpTitleThruLink = async (link) => {
            try {
              const findAnimeThruLink = async (title) => {
                try {
                  let data;
                  const response = await axios.get(
                    `${link}/${findConditionName(title)}`
                  );
                  if (
                    response.status === 200 &&
                    response.data &&
                    response.data.results
                  ) {
                    data = response.data.results || [];
                  }
                  return data;
                } catch (e) {
                  console.log("findAnimeThruLinkEr: " + e);
                  return [];
                }
              };
              let searchResults = await findAnimeThruLink(
                findConditionName(title_english)
              );
              if (!searchResults || searchResults.length == 0) {
                searchResults = await findAnimeThruLink(
                  findConditionName(title)
                );
              }
              if (!searchResults || searchResults.length == 0) {
                return [];
              }
              const animeId = findBestSearchResult(searchResults);

              if (animeId) {
                const episodeInfo = await axios.get(
                  `${link}/info?id=${animeId}`
                );
                let episodeTitleList;
                if (episodeInfo.status === 200) {
                  episodeTitleList = episodeInfo.data.episodes.map((el) => {
                    return {
                      title: el.title,
                      num: el.number,
                    };
                  });
                }
                return episodeTitleList;
              } else {
                return [];
              }
            } catch (e) {
              console.log("findEpTitleThruLinkEr: " + e);
              return [];
            }
          };
          for (let link of apiLinkList) {
            episodeTitleList = await findEpTitleThruLink(link);
            if (episodeTitleList && episodeTitleList.length > 0) {
              break;
            }
          }
          return episodeTitleList;
        } catch (e) {
          console.log("findEpTitleThruAPIEr: " + e);
          return [];
        }
      };
      const findEpTitleThruLibrary = async () => {
        let episodeTitleList = [];
        try {
          const findEpTitleThruSite = async (site) => {
            const findAnimeThruSite = async (title) => {
              try {
                const data = await site.search(title);
                return data?.results || [];
              } catch (e) {
                console.log("title: " + title);
                console.log("findAnimeThruSiteEr: " + e);
                return [];
              }
            };
            try {
              let searchResults = await findAnimeThruSite(
                findConditionName(title_english)
              );
              if (!searchResults && searchResults.length === 0) {
                searchResults = await findAnimeThruSite(
                  findConditionName(title)
                );
              }
              if (!searchResults && searchResults.length === 0) {
                return [];
              }
              const animeId = findBestSearchResult(searchResults);

              const episodeInfo = await site.fetchAnimeInfo(animeId);
              let episodeTitleList;

              if (
                episodeInfo &&
                episodeInfo.episodes &&
                episodeInfo.episodes.length > 0
              ) {
                episodeTitleList = episodeInfo.episodes.map((el) => {
                  return {
                    title: el.title,
                    num: el.number,
                  };
                });
              }
              return episodeTitleList;
            } catch (e) {
              console.log("findEpTitleThruSiteEr: " + e);
              return [];
            }
          };
          for (let siteName of librarySiteList) {
            let site;
            switch (siteName) {
              case "zoro":
                site = zoro;
                break;
              case "9anime":
                site = nineAnime;
                break;
              case "enime":
                site = enime;
                break;
            }
            episodeTitleList = await findEpTitleThruSite(site);
            if (episodeTitleList && episodeTitleList.length > 0) {
              break;
            }
          }
          return episodeTitleList;
        } catch (e) {
          console.log("findEpTitleThruLibraryEr: " + e);
          return [];
        }
      };
      const findEpisodeTitleBySiteName = async () => {
        let episodeTitleList = [];
        try {
          episodeTitleList = await findEpTitleThruLibrary();
          if (!episodeTitleList || episodeTitleList.length == 0) {
            episodeTitleList = await findEpTitleThruAPI();
          }
        } catch {
          console.log("findEpisodeTitleBySiteNameEr: " + e);
          episodeTitleList = await findEpTitleThruAPI();
        } finally {
          return episodeTitleList || [];
        }
      };
      const findEpTitleThruZoro = async () => {
        try {
          const best_result = await findBestZoroResult(
            findConditionName(title_english)
          );
          const baseURL = "https://zoro.to/ajax/v2/episode/list";
          if (!best_result) return [];
          const animeId = best_result.best_result.split("-").pop();
          const html = (await axios.get(`${baseURL}/${animeId}`)).data.html;
          const $ = cheerio.load(html);
          let epTitleList = [];
          $(".ep-name").each((i, el) => {
            const epTitle = $(el).text();
            const epJpanTitle = $(el).attr("data-jname");
            const epNum = i + 1;
            epTitleList.push({
              epNum,
              epTitle,
              epJpanTitle,
            });
          });
          return epTitleList;
        } catch (e) {
          console.log("findEpTitleThruZoroEr: " + e);
          return [];
        }
      };
      const anilist_query = `
                    query($idMal: Int) {
                        Media(idMal: $idMal, type: ANIME) {
                            streamingEpisodes {
                                title
                                thumbnail
                                url
                            }
                        }
                    }
                `;
      const anilist_variable = {
        idMal: id,
      };
      const response = await Promise.allSettled([
        //find title ofepisodes at jikan api
        axios.get(`https://api.jikan.moe/v4/anime/${id}/videos`),
        //find title of episodes at anilist api
        axios("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          data: JSON.stringify({
            query: anilist_query,
            variables: anilist_variable,
          }),
        }),
        findEpisodeTitleBySiteName(),
        findEpTitleThruZoro(),
      ]);

      const jikan_video =
        response[0].status !== "rejected" &&
        response[0].value.data.status !== 404
          ? response[0].value.data.data.episodes
          : [];
      const anilist_video =
        response[1].status !== "rejected"
          ? response[1].value.data.data.Media.streamingEpisodes
          : [];
      const site_video =
        response[2].status !== "rejected" ? response[2].value : [];
      const zoro_video =
        response[3].status !== "rejected" ? response[3].value : [];
      let eng_sub_episode_list = [];
      if (site_video) {
        eng_sub_episode_list = site_video;
      } else if (jikan_video && jikan_video.length > 0) {
        eng_sub_episode_list = jikan_video.map((el, index) => {
          return {
            title: el.title,
            img: el.images.jpg.image_url || "",
            num: el.mal_id,
          };
        });
      } else if (zoro_video) {
        eng_sub_episode_list = zoro_video;
      } else if (anilist_video && anilist_video.length > 0) {
        eng_sub_episode_list = anilist_video.map((el, index) => {
          return {
            title: el.title,
            img: el.thumbnail || "",
            num: index + 1,
          };
        });
      }

      if (eng_sub_episode_list.length === 0) {
        for (let i = 0; i < total_eps; i++) {
          eng_sub_episode_list.push({
            title: `Episode ${i + 1}`,
            img: img || "",
            num: i + 1,
          });
        }
      }
      return eng_sub_episode_list;
    } catch (e) {
      console.log("findEnglishEisodeTitleEr: " + e);
      return [];
    }
  };
  try {
    const response = await Promise.allSettled([
      findEnglishEisodeTitle(),
      findVietsubEpisodeTitle(),
    ]);
    let eng_sub_episode_list = response[0].value;
    let viet_sub_episode_list =
      response[1].value.length > 0 ? response[1].value : eng_sub_episode_list;
    console.log("eng_sub_episode_list: ");
    console.log(eng_sub_episode_list);
    console.log("viet_sub_episode_list: ");
    console.log(viet_sub_episode_list);
    if (
      eng_sub_episode_list &&
      !eng_sub_episode_list[0].hasOwnProperty("img") &&
      viet_sub_episode_list &&
      viet_sub_episode_list[0]["img"]
    ) {
      for (let i = 0; i < viet_sub_episode_list.length; i++) {
        if (viet_sub_episode_list[i]["img"]) {
          eng_sub_episode_list[i]["img"] = viet_sub_episode_list[i]["img"];
        } else {
          console.log("img: " + img);
          eng_sub_episode_list[i]["img"] = img || "";
        }
      }
    }

    return {
      engSub: eng_sub_episode_list,
      vietSub: viet_sub_episode_list,
    };
  } catch (e) {
    console.log("findEpisodeTitleEr: " + e);
    return {
      engSub: [],
      vietSub: [],
    };
  }
};
