import { getAnimeDocs } from "../../../fetch/firestore/getAnimeDocs.js";
import {
  getLocalDateString,
  getPlayerFromSites,
} from "../../../../../utils/utils.js";
import { collectionRef } from "../../../../../config/firebase-config.js";

export const updateExpiredEpisodeUrl = async () => {
  try {
    //Get documents having updatedOn date that passes 5 days for vietSub and 14 days for engSub
    const vietSubAnimeDocs = await getAnimeDocs(1);
    const engSubAnimeDocs = await getAnimeDocs(14);
    // List of all anime player_list that need to be updated
    const vietSubPlayerList = vietSubAnimeDocs.map((el) => {
      return {
        docData: el.docData.vietSub.final_player_list,
        docId: el.docId,
      };
    });
    const engSubPlayerList = engSubAnimeDocs.map((el) => {
      return {
        docData: el.docData.engSub.sub.final_player_list,
        docId: el.docId,
      };
    });
    const engDubPlayerList = engSubAnimeDocs.map((el) => {
      return {
        docData: el.docData.engSub.dub.final_player_list,
        docId: el.docId,
      };
    });
    // Where to save the updates in Firestore
    const vietSubUpdateLocation = `vietSub.final_player_list`;
    const engSubUpdateLocation = `engSub.sub.final_player_list`;
    const engDubUpdateLocation = `engSub.dub.final_player_list`;

    const upDateEpisode = async (playerList, updateLocation) => {
      try {
        for (let eachAnimeData of playerList) {
          const eachAnime = eachAnimeData.docData;
          let docId = eachAnimeData.docId;
          let promisePlayerList = [];
          //Example: promisePlayerList = [
          //    [ getPlayerFromSites("animeaz", "naruto-tap1"),
          //      getPlayerFromSites("animeaz", "naruto-tap1"),
          //      getPlayerFromSites("animeaz", "naruto-tap1")
          //    ]
          // ]
          let eachAnimeFinalPlayerList = {};
          const totalServers = Object.keys(eachAnime).length; // example: totalServers: 3
          const totalEpisodesOfEachServer = Object.values(eachAnime)[0].length; // example: totalEpisodesOfEachServer: 12
          for (
            let episodeIndex = 0;
            episodeIndex < totalEpisodesOfEachServer;
            episodeIndex++
          ) {
            let promiseList = []; // This list contains each episode of each server. example: it contains episode 1 of animeaz, vuianime, and animet servers to run them with Promise.all
            // example: promiseList = [
            //       getPlayerFromSites("animeaz", "naruto-tap1"),
            //       getPlayerFromSites("animeaz", "naruto-tap1"),
            //       getPlayerFromSites("animeaz", "naruto-tap1")
            //   ]
            for (
              let serverIndex = 0;
              serverIndex < totalServers;
              serverIndex++
            ) {
              const serverName = Object.keys(eachAnime)[serverIndex];
              const epDetails =
                Object.values(eachAnime)[serverIndex][episodeIndex];

              if (serverName && epDetails) {
                // const isExpiredVideo =
                //   Object.values(eachAnime)[serverIndex][
                //     episodeIndex
                //   ].video.includes("https://scontent");
                // if (isExpiredVideo) {
                eachAnimeFinalPlayerList[serverName] = [];
                promiseList.push({
                  func: getPlayerFromSites,
                  args: [serverName, epDetails.episodeId, epDetails.ep_num],
                });
                // } else {
                //   eachAnimeFinalPlayerList[serverName] =
                //     Object.values(eachAnime)[serverIndex];
                // }
              }
            }
            promisePlayerList.push(promiseList);
          }

          // Looping thru the promisePlayerList and run promise.all on each promList
          for (
            let promListIndex = 0;
            promListIndex < promisePlayerList.length;
            promListIndex++
          ) {
            const players = await Promise.all(
              promisePlayerList[promListIndex].map((prom) => {
                return prom.func(prom.args[0], prom.args[1], prom.args[2]);
              })
            );

            // Lopping thru every results getting the getPlayerFromSites() function
            for (let player of players) {
              if (player) {
                const server_name = player.server_name;
                const video = player.video;
                const type_video = player.type_video;
                const ep_num = player.ep_num;
                const episodeId = player.episodeId;
                console.log(`Episode ${ep_num}`);
                console.log("server_name: " + server_name);
                eachAnimeFinalPlayerList[server_name].push({
                  video,
                  type_video,
                  episodeId,
                  ep_num,
                });
              } else {
                eachAnimeFinalPlayerList[server_name].push({
                  video: "",
                  type_video: "",
                  episodeId,
                  ep_num,
                });
              }
            }
            console.log("eachAnimeFinalPlayerList:");
            console.log(eachAnimeFinalPlayerList);
          }
          //update document in Firestore
          const docRef = collectionRef.doc(docId);
          await Promise.all([
            docRef.update({
              [updateLocation]: eachAnimeFinalPlayerList,
            }),
            docRef.update({
              updatedOn: getLocalDateString(0), //update the "updateOn" property to today's date
            }),
          ]);
        }
      } catch (e) {
        console.log("upDateEpisodeEr: " + e);
      }
    };
    await Promise.all([
      upDateEpisode(vietSubPlayerList, vietSubUpdateLocation),
      upDateEpisode(engSubPlayerList, engSubUpdateLocation),
      upDateEpisode(engDubPlayerList, engDubUpdateLocation),
    ]);
  } catch (e) {
    console.log("updateExpiredEpisodeUrlEr: " + e);
  }
};
