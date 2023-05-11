import findSearchResult from "../search/findSearchResult.js";
import findEpLists from "../info/findEpLists.js";
import findVideoResult from "../video/findVideoResult.js";
import { initializeFirestore } from "../database/store/addNew/firestore/run once/addDataToFirestore.js";
import { createPages } from "../../config/puppeteer.js";
import axios from "axios";
import atob from "atob";
import { ANIME } from "@consumet/extensions";
import {
  findConditionName,
  findBestTitleInArray,
  findSearchTitle,
  getRootName,
} from "../../utils/utils.js";
import { getAllanimePlayer, getAnimefullPlayer } from "../video/getPlayer.js";
import { page_allanime } from "../../config/puppeteer-config.js";
import { chromium } from "playwright";
import CryptoJS from "crypto-js";
import cheerio from "cheerio";
import { findBestZoroResult } from "../search/findEngSubSearchResult.js";
import { getZoroPlayer } from "../video/getPlayer.js";
import { findZoroEps } from "../info/findEngSubEps.js";
import { collectionRef } from "../../config/firebase-config.js";
import { findTitleAndLinkList } from "../../utils/utils.js";
const searchOpts = {
  schema: {
    body: {
      type: "object",
      required: ["id", "title", "img", "total_eps", "title_english"],
      properties: {
        id: {
          type: ["integer", "string"],
        },
        title: {
          type: "string",
        },
        img: {
          type: "string",
        },
        total_eps: {
          type: ["integer", "string"],
        },
        title_english: {
          type: "string",
        },
        isCurrentSeason: {
          type: "boolean",
        },
      },
    },
  },
};
const router = async (fastify, options) => {
  fastify.get("/", (req, res) => {
    console.log("Hey");
    return res.send("Yo");
  });
  fastify.get("/init", async (req, res) => {
    await initializeFirestore();
    res.status(204).send("done");
  });
  fastify.get("/test", async (req, res) => {
    const title = req.query.q;
    const title_english = title;
    const id = "52305";
    const total_eps = 12;
    const { page_vuighe } = await createPages();
    const { data } = await axios.post("https://animeaz.me/api/v2/player/get", {
      code: "T21JQTcvWHN5aS91c2lDd0J1aVM4ZjJhaFVyVGdhbEhrYytpaGM2QUZ1VFlicXc3RG92Z1UzY09wdjcrTTdXdzAyRU9rRFlIdHJmdHJKNFA0MHZOTUt6c1dVYk1URTE4Zm5JQ0xnSi9mZnZnNWxmWmEycHNqRCtEdFZDQmt2YWU=",
      server: "Fe",
      tap_next:
        "https://animeaz.me/xem-anime/attack-on-titan-final-season-part-2-tap-1-t2713100.html",
    });
    const string = data.response;
    console.log(string);
    const result = string.replace(/\\/g, "");
    console.log(result);
    return result;
    // const findVietsubEpisodeTitle = async () => {
    //   const vuigheSearchTitle = findSearchTitle(title);
    //   const vuigheSearchTitleEnglish = title_english
    //     ? findSearchTitle(title_english)
    //     : vuigheSearchTitle;
    //   try {
    //     const seasonPosition = title.toLowerCase().search("season");
    //     const partPosition = title.toLowerCase().search("part");
    //     const isFinalSeason = title.toLowerCase().includes("final season"); //ex: Attack on titan final season part 2
    //     const find_best_vuighe_result = async () => {
    //       let vuighe_result;
    //       try {
    //         const title_elem =
    //           "body > div.container > section > div > div > a > div > div:nth-child(1)";
    //         const title_option = {
    //           title_elem,
    //           title_attribute: "textContent",
    //           seperators: [],
    //         };
    //         const link_elem = "body > div.container > section > div > div > a";
    //         const title_and_link_list = await findTitleAndLinkList(
    //           page_vuighe,
    //           `https://vuighe.net/tim-kiem/${vuigheSearchTitle}`,
    //           title_option,
    //           link_elem,
    //           null,
    //           `https://vuighe.net/tim-kiem/${vuigheSearchTitleEnglish}`,
    //           null,
    //           `https://vuighe.net/tim-kiem/${title.split(" ")[0]}`
    //         );

    //         console.log("vuighe_title_and_link_list: ");
    //         console.log(title_and_link_list);
    //         const findVuigheConditionTitle = (title) => {
    //           let final_title = title;
    //           if (seasonPosition !== -1) {
    //             if (isFinalSeason) {
    //               final_title = title
    //                 .toLowerCase()
    //                 .replace("the final season", "")
    //                 .replace("final season", "");
    //             } else {
    //               final_title = title.slice(0, seasonPosition - 1);
    //             }
    //           }
    //           if (partPosition !== -1) {
    //             const finalPartPosition = final_title
    //               .toLowerCase()
    //               .search("part");
    //             const partPositionNumber = final_title[finalPartPosition + 5];
    //             console.log("finalPartPosition: " + finalPartPosition);
    //             console.log("partPositionNumber: " + partPositionNumber);
    //             if (
    //               partPositionNumber !== " " &&
    //               !isNaN(Number(partPositionNumber))
    //             ) {
    //               console.log("final_title: " + final_title);
    //               final_title = final_title.slice(0, finalPartPosition - 1);
    //             }
    //           }
    //           return final_title;
    //         };
    //         const vuigheTitle = findVuigheConditionTitle(title);
    //         const vuigheTitleEnglish = findVuigheConditionTitle(title_english);
    //         console.log(vuigheTitle);
    //         console.log(vuigheTitleEnglish);
    //         if (title_and_link_list && title_and_link_list.length > 0) {
    //           vuighe_result = findBestTitleInArray(
    //             title_and_link_list,
    //             vuigheTitle,
    //             vuigheTitleEnglish
    //           );
    //         }
    //         console.log("vuighe_result: " + vuighe_result);
    //       } catch (e) {
    //         console.log("find_best_vuighe_result: " + e);
    //       } finally {
    //         return vuighe_result ? vuighe_result.best_result : null;
    //       }
    //     };
    //     const vuighe_best_result = await find_best_vuighe_result();
    //     console.log("vuighe_best_result: " + vuighe_best_result);
    //     if (vuighe_best_result) {
    //       let season;
    //       await page_vuighe.goto(vuighe_best_result, {
    //         waitUntil: "domcontentloaded",
    //         timeout: 20000,
    //       });
    //       async function check_season() {
    //         try {
    //           let ideal_title = findConditionName(title, false);
    //           //There will be cases like Attack on titan season 2 part 3
    //           // Or Spy x family part 2
    //           // Check if the title is season => convert 2nd seaosn to season 2
    //           // If not, convert the part 2 to season 2
    //           console.log("ideal_title: " + ideal_title);
    //           if (seasonPosition === -1)
    //             ideal_title = ideal_title
    //               .replace("part 2", "season 2")
    //               .replace("part 3", "season 3");
    //           //Convert Boku no hero academia 2 to Boku no hero academia seson 2
    //           const last_word = ideal_title[ideal_title.length - 1]; //last word of the titl. ex: title is spy x family part 2 => last_word is 2
    //           const is_last_word_a_number = !isNaN(Number(last_word));
    //           if (is_last_word_a_number && !title.includes("86"))
    //             ideal_title.replace(last_word, `season ${last_word}`);

    //           await page_vuighe.waitForSelector("#season-active");
    //           //click on season button to show all seasons
    //           await page_vuighe.click("#season-active");
    //           let season_names_array;
    //           let episode_range_list;
    //           try {
    //             const seasonInfo = await Promise.all([
    //               //find_which_season. Ex: season 1, season 2 => season_names_array: [1,2]
    //               page_vuighe.$$eval("span.season-item-name", (data) => {
    //                 return data.map((ele) =>
    //                   ele.textContent.replace("Season ", "").replace(" -  ", "")
    //                 );
    //               }),
    //               //find range_list. Ex; 1-12 or 12-24, ....
    //               page_vuighe.$$eval("span.season-item-range", (data) => {
    //                 return data.map((ele) => ele.textContent);
    //               }),
    //             ]);
    //             season_names_array = seasonInfo[0];
    //             episode_range_list = seasonInfo[1];
    //           } catch (e) {
    //             console.log("This anime has only one season");
    //             season = 1;
    //           }
    //           console.log("season_names_array: " + season_names_array);
    //           console.log("episode_range_list: " + episode_range_list);
    //           console.log("season: " + season);
    //           let firstEp = 1;

    //           if (isFinalSeason) {
    //             const first_ep_position = 0; // if isfinalSeason => season will be the first item in the season_names_array array
    //             season = season_names_array[0];
    //             episode_range_list[first_ep_position].split("-").shift();
    //             firstEp =
    //               first_ep_position !== -1
    //                 ? episode_range_list[first_ep_position].split("-").shift()
    //                 : 1;
    //           } else {
    //             season =
    //               seasonPosition !== -1 ? ideal_title[seasonPosition + 7] : 1; //ex: boku no hero academia season 2 => season: 2
    //             firstEp = season_names_array.findIndex(
    //               (el) => el.toString() === season.toString()
    //             );
    //           }
    //           return firstEp;
    //         } catch (e) {
    //           console.log(e);
    //           return "1";
    //         }
    //       }
    //       const firstEp = await check_season();
    //       if (firstEp) {
    //         await page_vuighe.goto(`${vuighe_best_result}/tap-${firstEp}`, {
    //           waitUntil: "domcontentloaded",
    //           timeout: 10000,
    //         });
    //       }
    //       await page_vuighe.waitForSelector(".episode-item", {
    //         timeout: 7000,
    //       });
    //       let [ep_title, ep_image] = await Promise.all([
    //         page_vuighe.$$eval(".grow > div:nth-child(1)", (data) => {
    //           return data.map((el) => el.textContent);
    //         }),
    //         page_vuighe.$$eval(
    //           ".episode-item > a > div:nth-child(1) > img",
    //           (data) => data.map((el) => el.src)
    //         ),
    //       ]);
    //       if (ep_title) {
    //         ep_title = ep_title.filter((el) => el.includes("Tập"));
    //         //Remove ova episode from the arrays
    //         const ova_ep_position = ep_title.findIndex((el) =>
    //           el.includes("Tập đặc biệt")
    //         );
    //         if (ova_ep_position !== -1) {
    //           ep_title.splice(ova_ep_position, 1);
    //           ep_image.splice(ova_ep_position, 1);
    //         }

    //         let episode_list = ep_title.map((el, index) => {
    //           return {
    //             num: index + 1,
    //             title: el,
    //             img: ep_image[index],
    //           };
    //         });
    //         //Ex:  Attack on titan season 3 part 2
    //         //On vuighe site season 3 will be 24 eps
    //         //=> if Part 2 we just get 12 eps out of it.
    //         //Checking if the title is a part anime

    //         const vuighe_total_eps = ep_title.length;
    //         if (Number(total_eps) !== Number(vuighe_total_eps)) {
    //           //Here we have 2 cases: this anime is first part, or this anime is second part
    //           //Checking if this anime is first or second part
    //           let isPart = false;
    //           if (partPosition !== -1) {
    //             const is_part_number = title.toLowerCase()[partPosition + 5];
    //             if (!isNaN(Number(is_part_number))) isPart = true;
    //           }
    //           let is_part_in_season = false; //ex: attack on titan season 3 part 2
    //           if (seasonPosition !== -1 && isPart) is_part_in_season = true;
    //           //If this anime is second part
    //           if (is_part_in_season) {
    //             const totalEpsOfFirstPart =
    //               Number(vuighe_total_eps) - Number(total_eps);
    //             //Example: vuighe list 26 eps;
    //             //But part 2 only has 12 eps => part 1 has 14 eps
    //             // => first episode of part 2 is episode 15
    //             //but we need the position (index) of that ep in a list
    //             // => episode 15 is at index 14 in the list;
    //             const firstEpisode = totalEpsOfFirstPart;
    //             episode_list = episode_list.slice(firstEpisode);
    //           } else {
    //             //if this anime is first part
    //             episode_list = episode_list.slice(0, total_eps);
    //           }
    //         }
    //         // If season is not season 1 => season must be 2 or larger;
    //         // the lines below will change "Tap 12" to "Tap 1" and so on
    //         for (let i = 0; i < episode_list.length; i++) {
    //           const original_title = episode_list[i].title;
    //           const ep_name = original_title.split(" - ").shift().trim(); //ex: Tập 1
    //           const ep_number = ep_name.replace("Tập ", ""); //ex: 1
    //           if (!isNaN(Number(ep_number))) {
    //             episode_list[i].num = i + 1;
    //             episode_list[i].title = original_title.replace(
    //               `Tập ${ep_number}`,
    //               `Tập ${ep_number - (ep_number - 1) + i}`
    //             ); // ex: ep_number - ep_difference = 14 - 13 => 1
    //           }
    //         }

    //         return episode_list;
    //       }
    //     } else return [];
    //   } catch (e) {
    //     console.log("findVietsubEpisodeTitleEr: " + e);
    //     return [];
    //   }
    // };

    // const result = getRootName(title);

    // console.log(result);
    // return res.send(result);
  });
  fastify.get("/anime47", async (req, res) => {
    // const thanhhoa = atob(
    //   "eyJjdCI6IlpBWGx0NCsrTnBkeVwvZmJ0bFlVaXBOK2ttSkw1VGl4RXNCRFg4SXJjSWlmRFV6YkJ5eGZiMzlnUCtzXC85TWl0UUcwYUJoQ3RCTjhtUVptSWdwRXQ0dThGNFNJY2FOYlVvUWpOU2hMemdFcGFiRkVkdVdVQ1hBaHpsM0VvSHpFTFZpVXFXSXBZMFJmRkk0MkUxRXJINmgzclF4KzBEN0FoNzJlYkZla0FiUjNGRkJjanBrbW9pZFNEWjhYYlZPYWo2ZHo0bnpOZ2FYT3ZoSytMVVQ4WFhkWGU1WW9ERDAxVGhNV09xeWRDcUN5d1p1cnRMcGhZUEM1cVpwUHFDOTJLK3VGZTB4dmxjUWZSU21laWc1RVwvQ2tvQktVd1JRNFgyb2RQblpON2V1dlRJUkxYWkxmbDdrcHVGdXNFWmhQSHpcL2tCOVwvZEFRNHVWcDJlR2JJeWFBNWpmSmQwcG5QaUFIcmN3YldpN0tNak5aYWc0dVF3VTZ4TURoa2VYekdpV0pNVHREbFJQZ000UlZ1ODAzQmFVVXpIcWZramlubGNjYWdMWGFoWEZIK2RSeVY1OHprSlwvaWszakZkWEhiMm9JUHIyS1ZJZ2wrUUQ3K3c3ZGZPMnFDenZvOXZNRndFSjMxakloNGlSOHpzanpmYURUVmlFZnFuQmFodHVTYXF3aGR1OW5PN0pBcU02YVVBUWZBOUd4VENybDlzVVc1eVdxeWRzelBQbjVZUEdZbVBmSU0xOEl1am9Zd3BLa3AxSU9IRHF2THVUMjl6TytxWTdjdmFLRWF4Zm0rbVowTndwMnZzYTRUV0dcL0ltZTV1OHlwUW5BZWt1ZzZZZzlNdUs4Y1VYYmRnNVdlYmhcLzVSNFJJUTJsVjlcL25wcXhVdG5cLytlRVFcL0NvZHJCd2s4MWJpMjRPOHNLUE5IaFhjdmhjUmhweHNHOVU5eUxYTDJna0Q0Um5PTDd3eWFLRlVYZzFWZUtjSWxva3pjOHptOGRINWEyZFFHdzR5RnE2VmVwSXROXC9qeHc0OTZUWnNZXC9JUDBMS0dGZFRaVDUxQlp1eGJLN2NOS3k0V3BtaXhySmV6SFQ5VVErbGd6bUJKYnRxczVwUW1USVRSZ0lGZ2VcL3phYXR5bjBHWnpUK1pGb1RJUXZkRldvZzhPMVFNdVZLbFd6VVhGZGhhb2I5OVNaN1VPMTNSZ0lnSTRYKzl0a2s1Zno0S09kbEpUeEs4Z3BaZEl3ckVRR1JKOXVQd1wvZHNpMFdJWHRGNGNRM3YrS1dxUm92U3FrcndrS3JRbG5PeGNpYzBCdTlPVWZSVTBBc0pnVGFpalRGVEhZVkJwaE9VZFVKKzhZeFVtZGtPNlZ4U2tBbmFDXC9tczZQeDRUMWNkcFVmUHI1S1lDQTlsUVVyT01HOE13WXY1OGo2XC8rYkRKQWtNYW5xaHdOT1BvNGtKQzBCMlpiYXJoRmh4WlJpVHg3ajJJRTBLS3RNclkxZnR2dVwvMWcyellwNUlPdWN3Rzludll6V2Q3UkdaeTVvalRJeldyRGxVYlwvREdBVExGQXh0ZkJLUFhMOHhVbjRRTmpjcEx5U2E5MjFXSGQydnAyeGsyZ3hDQTJlMkUzSWNyVGExSitvRk1sWXNhb1ljM2hNTDg5eUs5RHIzUW5iaThBcHhadWs1RndVTFNGNWpHZFNoeXFXMERLb3NPdHdERXc0TW10clFkbllnS0FEcTN2akVIY2hoRmhYZ1pyd2h0eWFxbldodERVYWEwcWlTNmEyTFwvMllJQVwvZUdcL1NvZUdUUThvWFwvd2xXdXBwdStER1NrS3BHYTY1SEh1RkZCV2FJb0FIM1RLZlp3K1QrMUJKNzN5K0dwdkRYQjBadG53U2JtUVBJbURiM0tzMFZqcG0zTDNVdk1HRkpvbzd2cE5sYU55MUhvRDZ3eWM2NDB3cGJuN3FcLzRpN3hsam9oZGxvQzljTU00SnAyUUtRM1hcL2xQZUJtVDhuR0xpUzVyWnR4bnRCb01HQjVcL1FQZ3pMUEd5ZW52cVpnTTNXMUxNUDJ5ZGxEdFlGS3I3Zmc1emRNU2IyME8rVUdVditERzVQVWlRendZdUIySGtRSVNobWxzTjlvZWl6R1NlXC9vOXBSdncxQ3NVcFwvbnVoU1I3SGRJZ2VHejl0ZGZlSFVaOWF3SWhzYU1EWk5BcDdwRXBwTndiM3B1aHo2V0lHY2h3cXhHZ25OaW9CZFRjZTJWQVwvQXZhTE8zZlNmVkNUWWJBUnFBTnp2bDFUUzBnVk83ZnduQm0xT1l1aDhERmtIQzdDY3NqVWM5b1FDU3RnVXYyWVlMK2g1WGVvdStDK0NieVBYK1UxMW9vM1I0XC9ZSXJXd2FSVVVVOG1NRVorRmdPRUFJdlIxSHIxdWt5cHlTQTVcL0tQUWhxRmNsWEhKSHloS2xXcitYd2ZmNklXM015cURxUyt1bjFIeUQ3bzRMdDFyNzNiVTNQRDYxMFB6Z1RZcE5jVFFSTWlsMkV5RURkTzk2cHRISHh3TFkwQWRBeVR5eEtVQ1IzakI3VWx4ZWVkR2dLQWxNRVNUcUJueFRtUDFpdVN2akw5S2xNcnJ4c1dzRm9yOGNrWnJKTzJGSkxVczE4OXlhOXZEMlBkZEk3QTVNN0hBVFpMYTRRRndqUll6WEFrR3FvSUIxcVlyT000c3BlWkk0UUhtZHh4aStNRmk4U3VXYmxLUT0iLCJpdiI6IjA4ZGI1Zjk5MTVhMzA1NTM1OWM2ODhhZmNhOGZkNmFiIiwicyI6IjQ5NjVjMmMzNGM0NzBlOWYifQ=="
    // );
    // console.log(thanhhoa);
    // const daklak = JSON.parse(
    //   CryptoJS.AES.decrypt(thanhhoa, "caphedaklak").toString(CryptoJS.enc.Utf8)
    // );
    // console.log(daklak);
    // res.send(daklak);
    const { data } = await axios.get(
      "https://animeweb.vip/wp-content/themes/halimmovies/player.php?episode_slug=tap-1&server_id=1&subsv_id=1&post_id=3549&nonce=&custom_var="
    );
    console.log(data);
  });
  // var episodeID = parseInt(92712),
  //   filmID = parseInt(30015);
  // jwplayer.key = "ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=";
  // jwplayer.key = "ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=";
  fastify.get("/vid", async (req, response) => {
    const host = "https://dokicloud.one";
    const host2 = "https://rabbitstream.net";
    const host3 = "https://rapid-cloud.co";
    const videoUrl = "https://zoro.to/watch/a-galaxy-next-door-18347?ep=100099";
    const id = videoUrl.split("/").pop()?.split("?")[0];
    const substringAfter = (str, toFind) => {
      const index = str.indexOf(toFind);
      return index == -1 ? "" : str.substring(index + toFind.length);
    };

    const substringBefore = (str, toFind) => {
      const index = str.indexOf(toFind);
      return index == -1 ? "" : str.substring(0, index);
    };

    const substringAfterLast = (str, toFind) => {
      const index = str.lastIndexOf(toFind);
      return index == -1 ? "" : str.substring(index + toFind.length);
    };

    const substringBeforeLast = (str, toFind) => {
      const index = str.lastIndexOf(toFind);
      return index == -1 ? "" : str.substring(0, index);
    };
    // let sources = undefined;

    const USER_AGENT =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
    const options = {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: videoUrl,
        "User-Agent": USER_AGENT,
      },
    };
    // const res = await axios.get(
    //   `${host}/ajax/embed-4/getSources?id=${id}`,
    //   options
    // );
    // if (!res.data.sources) {
    //   let { data: key } = await axios.get(
    //     "https://github.com/enimax-anime/key/blob/e4/key.txt"
    //   );

    //   key = substringBefore(
    //     substringAfter(key, '"blob-code blob-code-inner js-file-line">'),
    //     "</td>"
    //   );

    //   if (!key) {
    //     key = await (
    //       await axios.get(
    //         "https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt"
    //       )
    //     ).data;
    //   }
    //   const decryptedVal = CryptoJS.AES.decrypt(res.data.sources, key).toString(
    //     CryptoJS.enc.Utf8
    //   );
    //   sources = JSON.parse(decryptedVal)
    //     ? JSON.parse(decryptedVal)
    //     : res.data.sources;
    // }
    let decryptKey = await (
      await axios.get("https://github.com/enimax-anime/key/blob/e6/key.txt")
    ).data;

    decryptKey = substringBefore(
      substringAfter(decryptKey, '"blob-code blob-code-inner js-file-line">'),
      "</td>"
    );

    if (!decryptKey) {
      decryptKey = await (
        await axios.get(
          "https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt"
        )
      ).data;
    }

    if (!decryptKey) decryptKey = "c1d17096f2ca11b7";

    const res = await axios.get(
      `${host3}/ajax/embed-6/getSources?id=${"IAYHUW5NsJYh"}`,
      options
    );
    console.log(res.data);
    let { sources, tracks, intro, encrypted } = res.data;
    console.log(encrypted);
    try {
      if (encrypted) {
        const decrypt = CryptoJS.AES.decrypt(sources, decryptKey);
        console.log(decrypt);
        sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
        console.log(sources);
      }
    } catch (err) {
      throw new Error("Cannot decrypt sources. Perhaps the key is invalid.");
    }
    console.log(sources);
    let data = sources?.map((s) => ({
      url: s.file,
      isM3U8: s.file.includes(".m3u8"),
    }));
    let result = {
      sources: [],
      subtitles: [],
    };
    result.sources.push(...data);

    // for (const source of sources) {
    //   const { data } = await axios.get(source.file, options);
    //   const urls = data.split("\n").filter((line) => line.includes(".m3u8"));
    //   const qualities = data
    //     .split("\n")
    //     .filter((line) => line.includes("RESOLUTION="));

    //   const TdArray = qualities.map((s, i) => {
    //     const f1 = s.split("x")[1];
    //     const f2 = urls[i];

    //     return [f1, f2];
    //   });

    //   for (const [f1, f2] of TdArray) {
    //     this.sources.push({
    //       url: f2,
    //       quality: f1,
    //       isM3U8: f2.includes(".m3u8"),
    //     });
    //   }
    //   result.sources.push(...this.sources);
    // }

    result.sources.push({
      url: sources[0].file,
      isM3U8: sources[0].file.includes(".m3u8"),
      quality: "auto",
    });

    result.subtitles = res.data.tracks.map((s) => ({
      url: s.file,
      lang: s.label ? s.label : "Default (maybe)",
    }));

    return response.send(result);
  });
  fastify.post("/search", searchOpts, async (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const img = req.body.img;
    const total_eps = req.body.total_eps;
    const title_english = req.body.title_english;
    const isCurrentSeason = req.body.isCurrentSeason;
    const {
      browser,
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
      page_allanime,
    } = await createPages();
    await findSearchResult(
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
    );
    res.send("Request Received! Processing...");
    await browser.close();
  });
  fastify.post("/info", async (req, res) => {
    const searchResult = req.body.search_result;
    console.log(searchResult);
    const {
      browser,
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
      page_allanime,
    } = await createPages();
    await findEpLists(
      searchResult,
      browser,
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
      page_allanime
    );
    await browser.close();
  });
  fastify.post("/video", async (req, res) => {
    const {
      browser,
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
    const infoResult = req.body.info_result;
    await findVideoResult(
      infoResult,
      browser,
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
      page_allanime
    );
    await browser.close();
  });
};
export default router;
