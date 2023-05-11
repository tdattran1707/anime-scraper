import {
  delay,
  getVideoFromNetWorksTab,
  findAttributeContent,
  findTextContent,
  byPassSecurity,
} from "../../utils/utils.js";
import { mkdirSync, existsSync } from "fs";
import CryptoJS from "crypto-js";
import axios from "axios";
import { load } from "cheerio";

const getFEPlayer = async (page, serversButtonElement) => {
  let video = "";
  let type_video = "";
  try {
    const servers = await page.$$eval(serversButtonElement, (data) =>
      data.map((el) => el.textContent)
    );
    console.log(`Servers: ${servers}`);
    await page.evaluate((serversButtonElement) => {
      const servers = document.querySelectorAll(serversButtonElement);
      Array.from(servers).map((el) => {
        if (el.textContent.toLowerCase().includes("fe")) {
          el.click();
        }
      });
    }, serversButtonElement);
    await delay(6000);
    await page.waitForSelector("iframe", {
      timeout: 15000,
    });
    const iframe_url = await page.$eval("iframe", (data) => data.src);
    const elementHandle = await page.$("iframe");
    const frame = await elementHandle.contentFrame();
    console.log("iframe_url: " + iframe_url);
    try {
      await frame.evaluate(() => {
        const vidContainer = document.querySelector("#loading > div");
        vidContainer.click();
      });
      await frame.waitForSelector("video", { timeout: 8000 });
      video = await frame.$eval(
        "#vstr > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video",
        (data) => {
          return data.src;
        }
      );
    } catch (e) {
      console.log("getAnimeazVideoInIframeEr: " + e);
    }
    if (!video || video == "https://animeaz.me/ecplayer/errorvideo.mp4") {
      if (iframe_url) {
        video = iframe_url;
        type_video = "iframe";
      }
    } else {
      type_video = "m3u8";
    }
  } catch (e) {
    console.log("animeaz_fe_watch_er:" + e);
  } finally {
    return {
      video,
      type_video,
    };
  }
};
const handleAnimetvnIframe = async (page) => {
  let video = "";
  let type_video = "";
  try {
    const iframe = await page.$("iframe");
    const frame = await iframe.contentFrame();
    await frame.waitForSelector("video", { timeout: 10000 });
    video = await frame.$eval("video", (data) => data.src);
    console.log("iframeAnimetvn_video: " + video);
  } catch (e) {
    console.log("handleAnimetvnIframeEr: " + e);
  } finally {
    if (video) {
      type_video = "m3u8";
    } else {
      const iframe_url = await page.$eval("iframe", (data) => data.src);
      if (iframe_url) {
        video = iframe_url;
        type_video = "iframe";
      }
    }
    return {
      video,
      type_video,
    };
  }
};
const handleLotusIframe = async (page) => {
  let video = "";
  let type_video = "";
  try {
    await page.on("request", (request) => {
      if (request.url().endsWith("master.m3u8")) {
        video = request.url();
      }
    });
    await delay(2700);
    console.log("iframeLotus_video: " + video);
  } catch (e) {
    console.log("handleLotusIframeEr: " + e);
    return null;
  } finally {
    if (video) {
      type_video = "m3u8";
    } else {
      const iframe_url = await page.$eval("iframe", (data) => data.src);
      if (iframe_url) {
        video = iframe_url;
        type_video = "iframe";
      }
    }
    return {
      video,
      type_video,
    };
  }
};
const handleFemaxIframe = async (page) => {
  let video = "";
  let type_video = "";
  try {
    const iframe = await page.$("iframe");
    const frame = await iframe.contentFrame();
    await frame.evaluate(() => {
      const loadingContainer = document.querySelector(".faplbu");
      loadingContainer.click();
    });
    await frame.waitForSelector("video", { timeout: 10000 });
    video = await frame.$eval("video", (data) => data.src);
    console.log("iframeFemax_video: " + video);
  } catch (e) {
    console.log("handleFemaxIframeEr: " + e);
  } finally {
    if (video) {
      type_video = "m3u8";
    } else {
      try {
        const iframe_url = await page.$eval("iframe", (data) => data.src);
        if (iframe_url) {
          video = iframe_url;
          type_video = "iframe";
        }
      } catch (e) {
        console.log(e);
      }
    }
    return {
      video,
      type_video,
    };
  }
};
const findEpisodeId = (epWatching, removedEmelent) => {
  return epWatching
    .replace(".html", "")
    .replace(removedEmelent, "")
    .replaceAll("/", "*");
};
const getPlayerThruServers = async (page, epWatching, serversElement) => {
  let result = {
    video: "",
    type_video: "",
  };
  try {
    console.log("epWatching: " + epWatching);
    await page.goto(epWatching, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });
    const server_list = await findTextContent(page, serversElement);
    console.log("serverList:");
    console.log(server_list);
    for (let i = 1; i < server_list.length; i++) {
      await page.evaluate(
        (i, serversElement) => {
          const server = document.querySelector(
            `${serversElement}:nth-child(${i})`
          );
          server.click();
        },
        i,
        serversElement
      );
      await delay(3000);
      await page.waitForSelector("iframe", {
        timeout: 3000,
      });
      const iframe = await findAttributeContent(page, "iframe", "src", false);
      console.log(iframe);
      if (iframe.includes("animetvn.info/animetvn-player/")) {
        result = await handleAnimetvnIframe(page);
      } else if (iframe.includes("lotus")) {
        result = await handleLotusIframe(page);
      } else if (iframe.includes("femax")) {
        result = await handleFemaxIframe(page);
      }
      if (result && result.type_video == "m3u8") {
        break;
      }
    }
  } catch (e) {
    console.log("getPlayerThruServersEr: " + e);
  } finally {
    return result;
  }
};
export const getAnimeazPlayer = async (page, animeazEpList) => {
  if (!animeazEpList || animeazEpList.length === 0) return [];
  let player_list = [];

  const getAnimeazVideo = async (epWatching) => {
    let video = "";
    let type_video = "";
    try {
      console.log("animeazEpWatching: " + epWatching);
      await page.goto(epWatching, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await page.waitForSelector("#player", {
        timeout: 3000,
      });
      const elementHandle = await page.$("#player");
      const frame = await elementHandle.contentFrame();
      await frame.waitForSelector("video", { timeout: 6000 });
      video = await frame.$eval("video", (data) => {
        return data.src;
      });
      console.log("animeaz_video: " + video);
      if (!video || !video.includes("scontent")) {
        if (video.includes("blob")) {
          const result = await frame.evaluate(
            'jwplayer("jwplayer").getPlaylist()'
          );

          if (result) {
            video = result[0].file || "";
            type_video = video ? "m3u8" : "";
          }
        } else {
          const result = await getFEPlayer(
            page,
            "a.watch__wrapper-action--btn.button"
          );
          video = result.video || "";
          type_video = result.type_video || "";
        }
      } else {
        type_video = "m3u8";
      }
    } catch (er) {
      console.log("animeaz_watch_er: " + er);
      const result = await getFEPlayer(
        page,
        "body > div.wrapper > div.main > div > div > div.col.p-10.t-12.m-12 > div.main__content > div > div > div > div.watch__wrapper > div.watch__wrapper-server > div > a.watch__wrapper-action--btn.button"
      );
      video = result.video || "";
      type_video = result.type_video || "";
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  //checking if animeazEpList is a list of episodes url or it is just one episode url
  if (typeof animeazEpList === "object") {
    try {
      for (let i of animeazEpList) {
        const animeaz_ep_watching = i.ep_link;
        const episodeId = findEpisodeId(
          animeaz_ep_watching,
          "https://animeaz.me/xem-anime/"
        );
        if (animeazEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getAnimeazVideo(animeaz_ep_watching);
          const video = result.video || "";
          const type_video = result.type_video || "";
          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
    } catch (e) {
      console.log("getAnimeazVideoEr: " + e);
    } finally {
      return {
        server_name: "animeaz",
        player_list,
      };
    }
  } else if (typeof animeazEpList === "string") {
    //Getting the player if the animeazEpList is a animeazId
    //Ex:bleach-movie-2-mou-hitotsu-no-hyourinmaru-tap-full-t277448
    let video = "";
    let type_video = "";
    try {
      const result = await getAnimeazVideo(animeazEpList);
      video = result.video || "";
      type_video = result.type_video || "";
    } catch (e) {
      console.log("getAnimeazPlayerEr:" + e);
    } finally {
      return {
        server_name: "animeaz",
        video,
        type_video,
      };
    }
  }
};
export const getVuiAnimePlayer = async (page, vuianimeEpList) => {
  if (!vuianimeEpList || vuianimeEpList.length === 0) return [];
  let player_list = [];
  const getVuianimeVideo = async (vuianimeEpWatching) => {
    let video = "";
    let type_video = "";
    try {
      console.log(vuianimeEpWatching);
      await page.goto(vuianimeEpWatching, {
        waitUntil: "domcontentloaded",
        timeout: 13000,
      });
      await page.waitForSelector("video", { timeout: 5500 });
      video = await page.$eval("video", (result) => result.src);
      if (video) {
        type_video = "m3u8";
      } else {
        const result = await getFEPlayer(page, "span.btn.btn-sm.btn-success");
        video = result.video;
        type_video = result.type_video;
      }
    } catch (er) {
      console.log("vuianime_player_er: " + er);
      const result = await getFEPlayer(page, "span.btn.btn-sm.btn-success");
      video = result.video;
      type_video = result.type_video;
    } finally {
      console.log("vuianimePlayer: " + video);
      console.log("vuianimeTypeVideo: " + type_video);
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof vuianimeEpList == "object") {
    try {
      let max_number_episode; // The largest-numbered episode. ex: nisekoi's last ep is 12 => max_number_episode = 12
      let num = 1;
      while (!max_number_episode) {
        const last_ep = vuianimeEpList[vuianimeEpList.length - num].ep_num;
        console.log("vuianime_last_ep: " + last_ep);
        if (isNaN(Number(last_ep))) {
          if (last_ep.toLowerCase() === "full") max_number_episode = 1;
          else num++;
        } else max_number_episode = Number(last_ep);
      }

      for (let i = 0; i < max_number_episode; i++) {
        let vuianime_ep_watching_list = vuianimeEpList.filter(
          ({ ep_num }, index, self) => {
            let vuianime_ep = ep_num.replace("Full", "1");
            if (Number(vuianime_ep) === i + 1) return self[index];
          }
        );
        console.log("vuianime_ep_watching_list:");
        console.log(vuianime_ep_watching_list);
        let video = "";
        let type_video = "";
        for (let e = 0; e < vuianime_ep_watching_list.length; e++) {
          let vuianimeEpWatching = vuianime_ep_watching_list[e].ep_link;
          const episodeId = findEpisodeId(
            vuianimeEpWatching,
            "https://vuianime.pro/"
          );
          if (vuianimeEpList.length >= 70) {
            player_list.push({
              ep_num: vuianime_ep_watching_list[e].ep_num,
              video: "",
              type_video: "",
              episodeId,
            });
          } else {
            console.log("vuianimeEpWatching: " + vuianimeEpWatching);
            const result = await getVuianimeVideo(vuianimeEpWatching);
            video = result.video;
            type_video = result.type_video;
            player_list.push({
              ep_num: vuianime_ep_watching_list[e].ep_num,
              video: video || "",
              type_video: type_video || "",
              episodeId,
            });
            if (video && type_video) break;
          }
        }
      }
    } catch (e) {
      console.log("getVuiAnimePlayerEr: " + e);
    } finally {
      return {
        server_name: "vuianime",
        player_list,
      };
    }
  } else if (typeof vuianimeEpList == "string") {
    let video = "";
    let type_video = "";
    try {
      const result = await getVuianimeVideo(vuianimeEpList);
      video = result.video || "";
      type_video = result.type_video || "";
    } catch (e) {
      console.log("getVuiAnimePlayerEr: " + e);
    } finally {
      return {
        server_name: "vuianime",
        video,
        type_video,
      };
    }
  }
};
export const getAnimetPlayer = async (page, animetEpList) => {
  if (!animetEpList || animetEpList.length === 0) return [];
  let player_list = [];
  const getAnimetVideo = async (animetEpWatching) => {
    let video = "";
    let type_video = "";
    try {
      page.on("request", (request) => {
        if (
          request.url().endsWith(".m3u8") ||
          (request.url().startsWith("https://scontent.cdninstagram.com/") &&
            request.url().length > 1000)
        )
          video = request.url();
      });
      await page.goto(animetEpWatching, {
        waitUntil: "networkidle2",
        timeout: 13000,
      });
      await page.bringToFront();
      await delay(3000);
      console.log("animet_player: " + video);
    } catch (e) {
      console.log("getAnimetVideoEr: " + e);
    } finally {
      if (video) type_video = "m3u8";
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof animetEpList === "object") {
    try {
      for (let i of animetEpList) {
        const animetEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          animetEpWatching,
          "https://animet.net/"
        );
        if (animetEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          console.log("animetEpWatching: " + animetEpWatching);
          const result = await getAnimetVideo(animetEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";
          console.log("animetPlayer: " + video);

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
    } catch (e) {
      console.log("getAnimetPlayerEr: " + e);
    } finally {
      return {
        server_name: "animet",
        player_list,
      };
    }
  } else if (typeof animetEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const result = await getAnimetVideo(animetEpList);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getAnimetPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "animet",
      };
    }
  }
};
export const getAnime47Player = async (page, anime47EpList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const timeoutFunc = setTimeout(() => {
        reject(new Error("Function timed out after 45000 ms"));
      }, 450000); //Retun empty list if hangs for 10 mins
      if (!anime47EpList || anime47EpList.length === 0) return [];
      let player_list = [];
      const handleFaServer = async () => {
        let video = "";
        let type_video = "";
        try {
          await page.waitForSelector("video", { timeout: 10000 });
          await page.evaluate('jwplayer("player").skipAd()');
          video = await page.$eval(
            "#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video",
            (data) => data.src
          );
          if (video) type_video = "m3u8";
        } catch (e) {
          console.log("FA_er: " + e);
        } finally {
          return {
            video,
            type_video,
          };
        }
      };
      const handleFeServer = async () => {
        try {
          await page.click("#sv4");
          await page.waitForSelector("video", { timeout: 10000 });
          //Bring the tab to front. example: when open a lot of tabs, the last tab will be at front (we can see).
          //Use bringToFront() to bring the desired tab to the front (we can see it).
          page.bringToFront();
          //Wait for the video to play
          await delay(4000);
          await page.evaluate(
            'const player = jwplayer("player"); player.skipAd()'
          );
          await page.waitForSelector("iframe", {
            timeout: 15000,
          });
          const iframe_url = await page.$eval("iframe", (data) => data.src);
          console.log("iframe_url: " + iframe_url);
          await delay(3000); // wait for the frame to be reloaded
          let video = "";
          let type_video = "";

          const elementHandle = await page.$("iframe");
          const frame = await elementHandle.contentFrame();
          await frame.evaluate(() => {
            const vidContainer = document.querySelector("#loading > div");
            vidContainer.click();
          });

          await frame.waitForSelector("video", { timeout: 8000 });
          video = await frame.$eval("video.jw-video.jw-reset", (data) => {
            return data.src;
          });
          console.log("video: " + video);
          if (video) type_video = "m3u8";
          return { video, type_video };
        } catch (e) {
          console.log("getAnime47FeServerEr: " + e);
          return { video, type_video };
        }
      };
      const handleWaServer = async () => {
        let video = "";
        let type_video = "";
        try {
          await page.waitForSelector(
            "#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video",
            { timeout: 10000 }
          );
          const result = await page.evaluate(
            'jwplayer("player").getPlaylist()'
          );
          console.log("handleWaServerResult: ");
          console.log(result);
          if (result) {
            video = result[0].sources[0].file;
            type_video = "m3u8";
          }
        } catch (e) {
          console.log("handleWaServerEr: " + e);
        } finally {
          return {
            video,
            type_video,
          };
        }
      };
      const getAnime47Video = async (anime47EpWatching) => {
        let result = {
          video: "",
          type_video: "",
        };
        try {
          console.log("anime47EpWatching: " + anime47EpWatching);
          await page.goto(anime47EpWatching, {
            waitUntil: "domcontentloaded",
            timeout: 15000,
          });
          const security_question = await page.$("input#muoi");
          if (security_question) {
            await byPassSecurity(page, anime47EpWatching);
            if (page.url() !== anime47EpWatching) {
              await page.goto(anime47EpWatching, {
                waitUntil: "domcontentloaded",
                timeout: 15000,
              });
            }
          }
          await page.waitForSelector("span.btn.btn-green");
          const servers = await page.$$eval("span.btn.btn-green", (data) =>
            data.map((el) => el.textContent)
          );
          console.log("anime47Servers: ");
          console.log(servers);
          for (
            let serverIndex = 0;
            serverIndex < servers.length;
            serverIndex++
          ) {
            const server = servers[serverIndex];
            await page.evaluate((serverIndex) => {
              const serverBtn = document.querySelector(
                `span.btn.btn-green:nth-of-type(${serverIndex + 1})`
              );
              serverBtn.click();
            }, serverIndex);
            await delay(3700);
            switch (server) {
              case "Fa":
                result = await handleFaServer();
                break;
              case "Fe":
                result = await handleFeServer();
                break;
              case "Wa":
                result = await handleWaServer();
                break;
            }
            if (Object.values(result).every((value) => value !== "")) {
              break;
            }
          }
        } catch (e) {
          console.log("getAnime47Player_Er: " + e);
          result = await handleFeServer();
        } finally {
          console.log("anime47Player: ");
          console.log(result.video);
          return result;
        }
      };
      if (typeof anime47EpList === "object") {
        try {
          for (let i of anime47EpList) {
            const anime47_ep_watching = i.ep_link;
            console.log("anime47_ep_watching: " + anime47_ep_watching);
            const episodeId = findEpisodeId(
              anime47_ep_watching,
              "https://anime47.com/"
            );
            if (anime47EpList.length >= 70) {
              player_list.push({
                ep_num: i.ep_num,
                video,
                type_video,
                episodeId,
              });
            } else {
              const result = await getAnime47Video(anime47_ep_watching);
              const video = result.video || "";
              const type_video = result.type_video || "";
              player_list.push({
                ep_num: i.ep_num,
                video,
                type_video,
                episodeId,
              });
            }
          }
        } catch (e) {
          console.log("getAnime47PlayerEr: " + e);
        } finally {
          resolve({
            server_name: "anime47",
            player_list,
          });
        }
      } else if (typeof anime47EpList === "string") {
        let video = "";
        let type_video = "";
        try {
          const anime47EpWatching = anime47EpList.replace("*", "/");
          const result = await getAnime47Video(anime47EpWatching);
          video = result.video;
          type_video = result.type_video;
        } catch (e) {
          console.log("getAnime47PlayerEr: " + e);
        } finally {
          resolve({
            video: video,
            type_video: type_video,
            server_name: "anime47",
          });
        }
      }
      // If the function completes successfully, clear the timeout and resolve the promise
      clearTimeout(timeoutFunc);
    } catch (e) {
      console.log("getAnime47PlayerEr: " + e);
      resolve([]);
    }
  });
};
export const getAnimefullPlayer = async (page, animefullEpList) => {
  if (!animefullEpList || animefullEpList.length === 0) return [];
  let player_list = [];
  const getAnimefullVideo = async (animefullEpWatching) => {
    let video = "";
    let type_video = "";
    try {
      console.log("animefullEpWatching: " + animefullEpWatching);
      page.on("request", async (request) => {
        if (request.url().endsWith("master.m3u8")) video = request.url();
      });
      await page.goto(animefullEpWatching, {
        waitUntil: "networkidle2",
        timeout: 13000,
      });
      await delay(3000);
      //Skip ads
      await page.evaluate(
        'const player = jwplayer("media-player"); player.skipAd()'
      );
      await delay(2000);
      console.log("animefull_player: " + video);
    } catch (e) {
      console.log("animefull_player_er: " + e);
    } finally {
      if (video) type_video = "m3u8";
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof animefullEpList === "object") {
    try {
      for (let i of animefullEpList) {
        const animefullEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          animefullEpWatching,
          "https://animefull2.org/xem-phim/"
        );
        if (animefullEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getAnimefullVideo(animefullEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
    } catch (e) {
      console.log("getAnimefullPlayerEr: " + e);
    } finally {
      return {
        server_name: "animefull",
        player_list,
      };
    }
  } else if (typeof animefullEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const result = await getAnimefullVideo(animefullEpList);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getAnimefullPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "animefull",
      };
    }
  }
};
export const getHpandaPlayer = async (page, hpandaEpList) => {
  if (!hpandaEpList || hpandaEpList.length === 0) return [];
  let player_list = [];
  const getHpandaVideo = async (hpandaEpWatching) => {
    let video = "";
    let type_video = "";
    try {
      console.log("hpandaEpWatching: " + hpandaEpWatching);
      video = await getVideoFromNetWorksTab(page, hpandaEpWatching);
    } catch (e) {
      console.log("getHpandaEr: " + e);
    } finally {
      if (video) type_video = "m3u8";
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof hpandaEpList === "object") {
    try {
      for (let i of hpandaEpList) {
        const hpandaEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          hpandaEpWatching,
          "https://hhpanda.tv/"
        );
        if (hpandaEpList.length >= 70) {
          const episodeId = findEpisodeId(
            hpandaEpWatching,
            "https://hhpanda.tv/"
          );
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getHpandaVideo(hpandaEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
      console.log("hpanda_player_list:");
      console.log(player_list);
    } catch (e) {
      console.log("getHpandaPlayerEr: " + e);
    } finally {
      return {
        server_name: "hpanda",
        player_list,
      };
    }
  } else if (typeof hpandaEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const result = await getHpandaVideo(hpandaEpWatching);
      video = result.video;
      type_video = result.video;
    } catch (e) {
      console.log("getHpandaPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "hpanda",
      };
    }
  }
};
export const getXemanimePlayer = async (page, xemanimeEpList) => {
  if (!xemanimeEpList || xemanimeEpList.length === 0) return [];
  let player_list = [];
  if (typeof xemanimeEpList === "object") {
    try {
      for (let i of xemanimeEpList) {
        const xemanimeEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          xemanimeEpWatching,
          "https://xemanime.net/xem-phim/"
        );
        if (xemanimeEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          //Checking if player_list already has the episode
          if (player_list.some((el) => el.ep_num === i.ep_num)) {
            continue;
          }
          let result;
          let video = "";
          let type_video = "";
          try {
            console.log("xemanimeEpWatching: " + xemanimeEpWatching);
            result = await getPlayerThruServers(
              page,
              xemanimeEpWatching,
              "#list_sv > a.button-default"
            );
            video = result.video;
            type_video = result.type_video;
          } catch (e) {
            console.log("getXemanimePlayerEr: " + e);
            await page.reload({ waitUntil: "networkidle2", timeout: 13000 });
            result = await getPlayerThruServers(
              page,
              xemanimeEpWatching,
              "#list_sv > a.button-default"
            );
            video = result.video;
            type_video = result.type_video;
          }

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
      // console.log("xemanime_player_list:");
      // console.log(player_list);
    } catch (e) {
      console.log(`getXemanimePlayerEr: ` + e);
    } finally {
      return {
        server_name: "xemanime",
        player_list,
      };
    }
  } else if (typeof xemanimeEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const xemanimeEpWatching = xemanimeEpList;
      const result = await getPlayerThruServers(
        page,
        xemanimeEpWatching,
        "#list_sv > a.button-default"
      );
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getHpandaPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "xemanime",
      };
    }
  }
};
export const getAnimetvnPlayer = async (page, animetvnEpList) => {
  if (!animetvnEpList || animetvnEpList.length === 0) return [];
  let player_list = [];
  if (typeof animetvnEpList === "object") {
    try {
      for (let i of animetvnEpList) {
        const animetvnEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          animetvnEpWatching,
          "https://animetvn.xyz/xem-phim/"
        );
        if (animetvnEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          console.log("animetvnEpWatching: " + animetvnEpWatching);
          const result = await getPlayerThruServers(
            page,
            animetvnEpWatching,
            "#more-servers > a"
          );
          let video = result.video;
          let type_video = result.type_video;

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
    } catch (e) {
      console.log("getAnimeTvnEr: " + e);
    } finally {
      return {
        server_name: "animetvn",
        player_list,
      };
    }
  } else if (typeof animetvnEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const result = await getPlayerThruServers(
        page,
        animetvnEpList,
        "#more-servers > a"
      );
      video = result.video;
    } catch (e) {
      console.log("getAnimeTvnEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "animetvn",
      };
    }
  }
};
export const getYugenPlayer = async (page, yugenEpList) => {
  if (!yugenEpList || yugenEpList.length === 0) return [];
  let player_list = [];
  const getYugenVideo = async (yugen_ep_watching) => {
    let video = "";
    let type_video = "";
    try {
      const yugenEpWatching = yugen_ep_watching.includes("https://yugen.to")
        ? yugen_ep_watching
        : `https://yugen.to${yugen_ep_watching}`;
      console.log("yugenEpWatching: " + yugenEpWatching);
      video = await getVideoFromNetWorksTab(page, yugenEpWatching);
      const yugenScreenShotPath = "src/screenshots";
      if (!existsSync(yugenScreenShotPath)) {
        mkdirSync(yugenScreenShotPath);
        await page.screenshot({
          path: `${yugenScreenShotPath}/getYugenPlayer.png`,
          fullPage: true,
        });
      } else {
        await page.screenshot({
          path: `${yugenScreenShotPath}/getYugenPlayer.png`,
          fullPage: true,
        });
      }
      if (video) type_video = "m3u8";
      else {
        try {
          await page.goto(yugenEpWatching, {
            waitUntil: "networkidle2",
            timeout: 13000,
          });
          const iframe = await page.$eval(
            "iframe#main-embed",
            (data) => data.src
          );
          if (iframe) {
            if (iframe.includes("https://")) video = iframe;
            else video = `https:${iframe}`;
            type_video = "iframe";
          } else video = "";
        } catch (e) {
          console.log("getYugenPlayerErr2: " + e);
        }
      }
    } catch (e) {
      console.log("getYugenPlayerErr: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof yugenEpList === "object") {
    try {
      for (let i of yugenEpList) {
        const yugenEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          yugenEpWatching,
          yugenEpWatching.includes("http")
            ? "https://yugen.to/watch/"
            : "/watch/"
        );
        if (yugenEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getYugenVideo(yugenEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
    } catch (e) {
      console.log("getYugenPlayerEr: " + e);
    } finally {
      return {
        server_name: "yugen",
        player_list,
      };
    }
  } else if (typeof yugenEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const yugenEpWatching = yugenEpList.replace(/\*/g, "/");
      const result = await getYugenVideo(yugenEpWatching);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getYugenPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "yugen",
      };
    }
  }
};
export const getAllanimePlayerOld = async (
  page,
  allanimeEpList,
  isDub = false
) => {
  if (!allanimeEpList || allanimeEpList.length === 0) return [];
  let player_list = [];
  const getAllAnimeVideo = async (allanime_ep_watching) => {
    let video = "";
    let type_video = "";
    try {
      const allanimeEpWatching = allanime_ep_watching.includes(
        "https://allanime.to"
      )
        ? allanime_ep_watching
        : `https://allanime.to${allanime_ep_watching}`;
      console.log("allanimeEpWatching: " + allanimeEpWatching);
      await page.goto(allanimeEpWatching, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      const allanimeScreenShotPath = "src/screenshots";
      //Taking screenshots to mimic human-like behaviors
      try {
        if (!existsSync(allanimeScreenShotPath)) {
          mkdirSync(allanimeScreenShotPath);
          await page.screenshot({
            path: `${allanimeScreenShotPath}/getAllanimePlayer.png`,
            fullPage: true,
          });
        } else {
          await page.screenshot({
            path: `${allanimeScreenShotPath}/getAllanimePlayer.png`,
            fullPage: true,
          });
        }
      } catch (e) {
        console.log(`allanimeScreenShotEr: ` + e);
      }
      await page.waitForSelector("button.source-btn", {
        timeout: 10000,
      });
      const servers = await page.$$eval("button.source-btn", (data) =>
        data.map((el) => el.className)
      );
      console.log("allanimeServers: ");
      console.log(servers);
      const getAllanimeVideoByServer = async (url_type, video_type) => {
        let video = "";
        let type_video = "";

        try {
          // page.on("request", (request) => {
          //   if (request.url().includes("https://playtaku.net/")) {
          //     console.log(request.url());
          //     video = request.url();
          //   }
          //   // console.log(request.url());
          // });
          // await delay(40000);
          video = await page.$eval("iframe", (data) => {
            return data.src;
          });

          const iframe = await page.$("iframe");
          const frame = await iframe.contentFrame();
          await frame.click();
          await frame.waitForSelector("video", {
            timeout: 4500,
          });
          video = await frame.$eval(
            "video > source",
            (data) =>
              data.src ||
              data.getAttribute("data-src") ||
              data.getAttribute("data-vs")
          );
        } catch (e) {
          console.log(e);
        } finally {
          if (video) type_video = video_type;
          return {
            video,
            type_video,
          };
        }
      };
      const serverLists = [
        "Yt-HD",
        "S-mp4",
        "Luf-mp4",
        "Vid-mp4",
        "Yt-mp4",
        "Sl-mp4",
        "Uv-mp4",
      ];

      for (let i = 0; i < servers.length; i++) {
        if (video) break;
        const server_name = servers[i]
          .replace("source-btn btn", "")
          .replace("active", "")
          .replace("text-info", "")
          .replace("text-danger", "")
          .trim();

        if (!serverLists.includes(server_name)) continue;
        console.log(server_name);
        await page.click(`.source-btn-group > button:nth-child(${i + 1})`);
        await delay(2500);
        switch (server_name) {
          case "Yt-HD":
            const ythdResult = await getAllanimeVideoByServer(null, "mp4");
            video = ythdResult.video;
            type_video = ythdResult.type_video;
            break;
          case "S-mp4":
            const smp4Rresult = await getAllanimeVideoByServer(
              "https://myanime.sharepoint.com/sites/chartlousty/_layouts",
              "mp4"
            );
            video = smp4Rresult.video;
            type_video = smp4Rresult.type_video;
            break;
          case "Luf-mp4":
            const lufmp4Result = await getAllanimeVideoByServer(
              ".gofcdn.com/videos/hls",
              "m3u8"
            );
            video = lufmp4Result.video;
            type_video = lufmp4Result.type_video;
            break;
          case "Vid-mp4":
            try {
              await page.waitForSelector("iframe#episode-frame", {
                timeout: 10000,
              });
              const iframe = await page.$("iframe#episode-frame");
              const frame = await iframe.contentFrame();
              const iframeChild = await frame.$("iframe#aablog-frame");
              const frame2 = await iframeChild.contentFrame();
              const result = await frame2.evaluate(
                `jwplayer("myVideo").getPlaylist()`
              );
              console.log(result);
              if (result) {
                video = result[0].file;
                type_video = video.endsWith("m3u8") ? "m3u8" : "mp4";
              }
            } catch (e) {
              console.log("Vid-mp4Er: " + e);
            }
            break;
          case "Yt-mp4":
            const ytmp4Result = await getAllanimeVideoByServer(
              ".gofcdn.com/videos/hls",
              "m3u8"
            );
            video = ytmp4Result.video;
            type_video = ytmp4Result.type_video;
            break;

          case "Sl-mp4":
            const slmp4Result = await getAllanimeVideoByServer(
              "https://larecontent.com/video?token=",
              "mp4"
            );
            video = slmp4Result.video;
            type_video = slmp4Result.video;
            break;
          case "Uv-mp4":
            const uvmp4Result = await getAllanimeVideoByServer(
              "https://pl.crunchyroll.com/",
              "m3u8"
            );
            video = uvmp4Result.video;
            type_video = uvmp4Result.video;
            break;
        }
        // await delay(3500);
      }
      console.log("video: " + video);
      console.log("type_video: " + type_video);
    } catch (e) {
      console.log("getAllanimeVideoErr: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof allanimeEpList === "object") {
    try {
      for (let i of allanimeEpList) {
        const allanimeEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          allanimeEpWatching,
          allanimeEpWatching.includes("https")
            ? "https://allanime.to/watch/"
            : "/watch/"
        );
        if (allanimeEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getAllAnimeVideo(allanimeEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video: video || "",
            type_video: type_video || "",
            episodeId,
          });
        }
      }
      console.log(
        `${isDub ? "allanime_player_list_dub: " : "allanime_player_list_sub: "}`
      );
      console.log(player_list);
    } catch (e) {
      console.log("getAllAnimePlayerEr: " + e);
    } finally {
      return {
        server_name: isDub ? "allanimeDub" : "allanime",
        player_list,
      };
    }
  } else if (typeof allanimeEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const allanimeEpWatching = allanimeEpList.replace(/\*/g, "/");
      const result = await getAllAnimeVideo(allanimeEpWatching);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getAllAnimePlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: isDub ? "allanimeDub" : "allanime",
      };
    }
  }
};
export const getAllanimePlayer = async (
  page,
  allanimeEpList,
  isDub = false
) => {
  if (!allanimeEpList || allanimeEpList.length === 0) return [];
  let player_list = [];
  const getAllAnimeVideo = async (allanime_ep_watching) => {
    let video = "";
    let type_video = "";
    try {
      const allanimeEpWatching = allanime_ep_watching.includes(
        "https://allanime.to"
      )
        ? allanime_ep_watching
        : `https://allanime.to${allanime_ep_watching}`;
      console.log("allanimeEpWatching: " + allanimeEpWatching);
      await page.goto(allanimeEpWatching, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await Promise.all([
        page.waitForSelector("button.Yt", { timeout: 8000 }),
        page.waitForSelector("iframe#episode-frame", { timeout: 8000 }),
      ]);
      await page.click("button.Yt");
      const iframe = await page.$("iframe#episode-frame");
      const frame = await iframe.contentFrame();
      await frame.waitForSelector("video", { timeout: 8000 });
      video = await frame.$eval(
        "video > source",
        (data) =>
          data.getAttribute("src") ||
          data.getAttribute("data-src") ||
          data.getAttribute("data-vs")
      );
      type_video = video ? "mp4" : "";
    } catch (e) {
      console.log("getAllAnimeVideoEr: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof allanimeEpList === "object") {
    try {
      for (let i of allanimeEpList) {
        const allanimeEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          allanimeEpWatching,
          allanimeEpWatching.includes("https")
            ? "https://allanime.to/watch/"
            : "/watch/"
        );
        if (allanimeEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getAllAnimeVideo(allanimeEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video: video || "",
            type_video: type_video || "",
            episodeId,
          });
        }
      }
      console.log(
        `${isDub ? "allanime_player_list_dub: " : "allanime_player_list_sub: "}`
      );
      console.log(player_list);
    } catch (e) {
      console.log("getAllAnimePlayerEr: " + e);
    } finally {
      return {
        server_name: isDub ? "allanimeDub" : "allanime",
        player_list,
      };
    }
  } else if (typeof allanimeEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const allanimeEpWatching = allanimeEpList.replace(/\*/g, "/");
      const result = await getAllAnimeVideo(allanimeEpWatching);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getAllAnimePlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: isDub ? "allanimeDub" : "allanime",
      };
    }
  }
};
export const getGogoanimePlayer = async (
  page,
  gogoanimeEpList,
  isDub = false
) => {
  if (!gogoanimeEpList || gogoanimeEpList.length === 0) return [];
  let player_list = [];
  const getVideoFromIfame = async () => {
    let video = "";
    let type_video = "";
    try {
      video = await page.$eval("iframe", (data) => data.src);
      if (video) type_video = "iframe";
    } catch (e) {
      console.log(`getVideoFromIfame: ` + e);
    } finally {
      return { video, type_video };
    }
  };
  const handleVidStreamOrGoGoServer = async (playerName) => {
    let video = "";
    let type_video = "";
    try {
      const iframe = await page.$("iframe");
      const frame = await iframe.contentFrame();
      const result = await frame.evaluate((playerName) => {
        return jwplayer(playerName).getPlaylist();
      }, playerName);
      console.log("gogoanimeVidcdnResult: ");
      console.log(result);
      if (result) {
        video = result[0].file;
        type_video = video.endsWith("m3u8") ? "m3u8" : "mp4";
      }
    } catch (e) {
      console.log("handleVidStreamServerEr: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  const handleXStreamServer = async () => {
    let video = "";
    let type_video = "";
    try {
      const iframe_url = await page.$eval("iframe", (data) => data.src);
      console.log(iframe_url);
      const iframe = await page.$("iframe");
      const frame = await iframe.contentFrame();
      await page.bringToFront();
      // wait 2.5 seconds for video to get its file
      await delay(3500);
      await frame.evaluate(() => {
        const loadingContainer = document.querySelector("#loading > div");
        loadingContainer.click();
      });
      await frame.waitForSelector("video", { timeout: 3000 });
      video = await frame.$eval("video", (data) => data.src);
      if (video) type_video = "m3u8";
    } catch (e) {
      console.log("handleXStreamServerEr: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  const handleDoodSteamServer = async () => {
    let video = "";
    let type_video = "";
    try {
      const iframe_url = await page.$eval(
        "#load_anime > div > div > iframe",
        (data) => data.src
      );
      console.log(iframe_url);
      const iframe = await page.$("#load_anime > div > div > iframe");
      const frame = await iframe.contentFrame();
      await page.bringToFront();
      await frame.waitForSelector("#video_player_html5_api", {
        timeout: 10000,
      });
      video = await frame.$eval("#video_player_html5_api", (data) => data.src);
      if (video) type_video = "mp4";
    } catch (e) {
      console.log(`handleDoodSteamServerEr: ` + e);
    } finally {
      return { video, type_video };
    }
  };
  const handleMp4Server = async () => {
    let video = "";
    let type_video = "";
    try {
      const iframe_url = await page.$eval("iframe", (data) => data.src);
      console.log(iframe_url);
      const iframe = await page.$("iframe");
      const frame = await iframe.contentFrame();
      await frame.waitForSelector("video");
      video = await frame.$eval("video", (data) => data.src);
      console.log(video);
    } catch (e) {
      console.log("handleMp4ServerEr: " + e);
    } finally {
      return { video, type_video };
    }
  };
  const getGogoanimeVideo = async (gogoanimeEpWatching) => {
    let video = "";
    let type_video = "";
    try {
      await page.goto(gogoanimeEpWatching, {
        waitUntil: "domcontentloaded",
        timeout: 13000,
      });
      const serverListElement = "div.anime_muti_link > ul > li";
      await page.waitForSelector(serverListElement, { timeout: 10000 });
      const serverList = await page.$$eval(serverListElement, (data) =>
        data.map((el) => el.className)
      );
      console.log("gogoanimeServerList: ");
      console.log(serverList);
      for (
        let serverIndex = 0;
        serverIndex < serverList.length;
        serverIndex++
      ) {
        const serverName = serverList[serverIndex];
        console.log("serverName: " + serverName);
        await page.click(
          `div.anime_muti_link > ul > li:nth-of-type(${
            serverIndex + Number(1)
          }) > a`
        );
        await delay(2000);
        let result;
        switch (serverName) {
          case "anime":
            result = await handleVidStreamOrGoGoServer("myVideo");
            break;
          case "vidcdn":
            result = await handleVidStreamOrGoGoServer("myVideo");
            break;
          case "streamsb":
            result = await handleVidStreamOrGoGoServer("mediaplayer");
            break;
          case "xstreamcdn":
            result = await handleXStreamServer();
            break;
          case "doodstream":
            result = await handleDoodSteamServer();
            break;
          case "mp4upload":
            result = await handleMp4Server();
            break;
        }
        video = result.video;
        if (video) {
          type_video = result.type_video;
          break;
        } else {
          result = await getVideoFromIfame();
          video = result.video;
          type_video = result.type_video;
        }
      }
    } catch (e) {
      console.log(e);
      const result = await getVideoFromIfame();
      video = result.video;
      type_video = result.type_video;
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof gogoanimeEpList === "object") {
    try {
      for (let i of gogoanimeEpList) {
        const gogoanimeEpWatching = i.ep_link;
        const episodeId = findEpisodeId(
          gogoanimeEpWatching,
          "https://gogoanime.tel/"
        );

        console.log("gogoanimeEpWatching: " + gogoanimeEpWatching);
        if (gogoanimeEpList.length > 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          const result = await getGogoanimeVideo(gogoanimeEpWatching);
          const video = result.video || "";
          const type_video = result.type_video || "";

          player_list.push({
            ep_num: i.ep_num,
            video,
            type_video,
            episodeId,
          });
        }
      }
      console.log(
        `${isDub ? "gogoanime_player_dub: " : "gogoanime_player_sub: "}`
      );
    } catch (e) {
      console.log("getGoGoAnimePlayerEr: " + e);
    } finally {
      return {
        server_name: isDub ? "gogoanimeDub" : "gogoanime",
        player_list,
      };
    }
  } else if (typeof gogoanimeEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      console.log(gogoanimeEpList);
      const result = await getGogoanimeVideo(gogoanimeEpList);
      video = result.video;
      type_video = result.video;
    } catch (e) {
      console.log("getGoGoAnimePlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: isDub ? "gogoanimeDub" : "gogoanime",
      };
    }
  }
};
export const getAnimeowlPlayer = async (page, animeowlEpList) => {
  if (!animeowlEpList || animeowlEpList.length === 0) return [];
  let player_list = [];
  const getAnimeowlVideo = async (animeowl_watching_ep) => {
    let video = "";
    let type_video = "";
    try {
      await page.goto(animeowl_watching_ep, {
        waitUntil: "networkidle2",
        timeout: 13000,
      });
      const result = await Promise.allSettled([
        findAttributeContent(page, "video", "src", false),
        findAttributeContent(page, "video", "type", false),
      ]);
      video = result[0].value || "";
      type_video = video ? result[1].value : "";
      console.log("animeowl_player: " + video);
    } catch (e) {
      console.log("getAnimeowlVideo_Er: " + e);
    } finally {
      return {
        video,
        type_video,
      };
    }
  };
  if (typeof animeowlEpList === "object") {
    try {
      for (let i of animeowlEpList) {
        let video = "";
        let type_video = "";
        const animeowl_watching_ep = i.ep_link;
        console.log("animeowl_watching_ep:  " + animeowl_watching_ep);
        const episodeId = findEpisodeId(
          animeowl_watching_ep,
          "https://portablegaming.co/watch/"
        );
        if (animeowlEpList.length >= 70) {
          player_list.push({
            ep_num: i.ep_num,
            video: "",
            type_video: "",
            episodeId,
          });
        } else {
          try {
            const result = await getAnimeowlVideo(animeowl_watching_ep);
            video = result.video;
            type_video = result.type_video;
          } catch (e) {
            console.log("getAnimeowlPlayerEr: " + e);
            await page.reload({ waitUntil: "networkidle2", timeout: 13000 });
            const result = await getAnimeowlVideo();
            video = result.video;
            type_video = result.type_video;
          } finally {
            player_list.push({
              ep_num: i.ep_num,
              video,
              type_video,
              episodeId,
            });
          }
        }
      }
    } catch (e) {
      console.log("getAnimeOwlPlayerEr: " + e);
    } finally {
      return {
        server_name: "animeowl",
        player_list,
      };
    }
  } else if (typeof animeowlEpList === "string") {
    let video = "";
    let type_video = "";
    try {
      const animeowlEpWatching = animeowlEpList.replaceAll("*", "/");
      const result = await getAnimeowlVideo(animeowlEpWatching);
      video = result.video;
      type_video = result.type_video;
    } catch (e) {
      console.log("getAnimeOwlPlayerEr: " + e);
    } finally {
      return {
        video: video,
        type_video: type_video,
        server_name: "animeowl",
      };
    }
  }
};
export const getZoroPlayer = async (zoroEpList, subOrDub, returned_result) => {
  if (!zoroEpList) {
    return [];
  }
  //we need decryptKey because the data is encrypted. We need to decrypt them
  const getDecryptKey = async () => {
    let decryptKeyHTML = await (
      await axios.get("https://github.com/enimax-anime/key/blob/e6/key.txt")
    ).data;
    const $ = load(decryptKeyHTML);
    let decryptKey = $("blob-code blob-code-inner js-file-line").text();
    if (!decryptKey) {
      decryptKey = await (
        await axios.get(
          "https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt"
        )
      ).data;
    }

    if (!decryptKey) decryptKey = "c1d17096f2ca11b7";
    return decryptKey;
  };
  const decryptKey = await getDecryptKey();
  console.log("decryptKey:" + decryptKey);
  let { time_stamp } = returned_result;

  const getZoroVideo = async (episodeId, index) => {
    try {
      const serverBaseURL = "https://zoro.to/ajax/v2/episode/servers";
      const sourceBaseURl = "https://zoro.to/ajax/v2/episode/sources";
      const sourceHost = "https://rapid-cloud.co/ajax/embed-6/getSources";
      const options = {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      };
      //Get serverId list
      const getServerIdList = async () => {
        console.log("episodeId: " + episodeId);
        const serverHTML = (
          await axios.get(`${serverBaseURL}?episodeId=${episodeId}`, options)
        ).data.html;
        const $ = load(serverHTML);

        let serverList = [];
        $(
          `div.ps_-block.ps_-block-sub.servers-${subOrDub} > div.ps__-list > div`
        ).each((i, el) => {
          const type = $(el).attr("data-type"); //Sub or Dub
          const serverId = $(el).attr("data-id"); //ex: 100085
          serverList.push({
            type,
            serverId,
          });
        });
        console.log(serverList);
        return serverList
          .filter(({ type }) => type === subOrDub)
          .map((el) => el.serverId);
      };
      const serverIdList = await getServerIdList();
      let result = {
        sources: [],
        subtitles: [],
        intro: [],
      };
      const getData = async (serverId, index) => {
        console.log("index: " + index);
        //Getting sourceId
        const referenceData = await axios.get(
          `${sourceBaseURl}?id=${serverId}`,
          options
        );
        const iframeLink = referenceData.data.link;
        const sourceId = iframeLink?.split("/").pop()?.split("?")[0];
        console.log(sourceId);
        //Getting final source data
        const sourceData = await axios.get(`${sourceHost}?id=${sourceId}`);
        let { sources, tracks, intro, encrypted } = sourceData.data;
        try {
          if (encrypted) {
            //Decrypt souces data only, because only sources is encrypted
            const decrypt = CryptoJS.AES.decrypt(sources, decryptKey);
            //getting the decrypted sources data (video links)
            sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
          }
        } catch (err) {
          throw new Error(
            "Cannot decrypt sources. Perhaps the key is invalid."
          );
        }

        if (!time_stamp || !time_stamp[index]) {
          time_stamp[index] = {
            ep_num: index + 1,
            time_stamp: [
              {
                interval: {
                  startTime: intro["start"],
                  endTime: Number(intro["start"]) + 90,
                },
                skipType: "op",
              },
              {
                interval: {
                  startTime: intro["end"],
                  endTime: Number(intro["end"]) + 90,
                },
                skipType: "ed",
              },
            ],
          };
        }
        console.log(time_stamp);
        let videoData = {
          ep_num: index + 1,
          episodeId: serverId,
          video: sources[0].file,
          type: sources[0].file.includes(".m3u8") ? "m3u8" : "mp4",
          subtitles: tracks,
          intro,
        };
        return videoData;
      };
      for (let serverId of serverIdList) {
        result = await getData(serverId, index);
        if (result) break;
      }
      return result;
    } catch (e) {
      console.log("getZoroVideoEr: " + e);
    }
  };
  const result = await Promise.all(
    zoroEpList.map((el, index) => {
      const episodeId = el.epId;
      return getZoroVideo(episodeId, index);
    })
  );
  returned_result["time_stamp"] = time_stamp;
  return {
    result,
    returned_result,
  };
};
