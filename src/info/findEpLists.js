import {
  findAnimeazEps,
  findVuianimeEps,
  findAnimetEps,
  findHpandaEps,
  findAnimefullEps,
  findAnime47Eps,
  findAnimetvnEps,
  findXemanimeEps,
} from "./findVietSubEps.js";
import {
  findYugenEps,
  findAllanimeEps,
  findGogoanimeEps,
  findAnimeowlEps,
  findZoroEps,
} from "./findEngSubEps.js";
import { findTextContent } from "../../utils/utils.js";
// import {
//   page,
//   page_vuianime,
//   page_animet,
//   page_anime47,
//   page_hpanda,
//   page_animefull,
//   page_xemanime,
//   page_animetvn,
//   page_allanime,
//   page_yugen,
//   page_animeowl,
//   page_gogo,
//   page_gogoanime_dub,
// } from "../../config/puppeteer-config.js";
import axios from "axios";
const findEpLists = async (
  search_result,
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
) => {
  console.log(search_result);
  const animeazFinalResult = search_result.animeazFinalResult;
  const animetFinalResult = search_result.animetFinalResult;
  const vuianimeFinalResult = search_result.vuianimeFinalResult;
  const hpandaFinalResult = search_result.hpandaFinalResult;
  const anime47FinalResult = search_result.anime47FinalResult;
  const animefullFinalResult = search_result.animefullFinalResult;
  const xemanimeFinalResult = search_result.xemanimeFinalResult;
  const animetvnFinalResult = search_result.animetvnFinalResult;
  const yugenFinalResult = search_result.yugenFinalResult;
  const allanimeFinalResult = search_result.allanimeFinalResult;
  const gogoanimeFinalResult = search_result.gogoanimeFinalResult;
  const animeowlFinalResult = search_result.animeowlFinalResult;
  const zoroFinalResult = search_result.zoroFinalResult;
  const animeazUrl = animeazFinalResult ? animeazFinalResult.best_result : "";
  const vuianimeUrl = vuianimeFinalResult
    ? vuianimeFinalResult.best_result
    : "";
  const animetUrl = animetFinalResult ? animetFinalResult.best_result : "";
  const hpandaUrl = hpandaFinalResult ? hpandaFinalResult.best_result : "";
  const anime47Url = anime47FinalResult ? anime47FinalResult.best_result : "";
  const xemanimeUrl = xemanimeFinalResult
    ? xemanimeFinalResult.best_result
    : "";
  const animefullUrl = animefullFinalResult
    ? animefullFinalResult.best_result
    : "";
  const animetvnUrl = animetvnFinalResult
    ? animetvnFinalResult.best_result
    : "";
  const yugenUrl = yugenFinalResult ? yugenFinalResult.best_result : "";
  const allanimeUrl = allanimeFinalResult
    ? allanimeFinalResult.best_result
    : "";
  const gogoanimeUrl = gogoanimeFinalResult
    ? gogoanimeFinalResult.best_result
    : "";
  const animeowlUrl = animeowlFinalResult
    ? animeowlFinalResult.best_result
    : "";
  const animeazIsPartAnime = animeazFinalResult
    ? animeazFinalResult.isPartAnime
    : false;
  const vuianimeIsPartAnime = vuianimeFinalResult
    ? vuianimeFinalResult.isPartAnime
    : false;
  const animetIsPartAnime = animetFinalResult
    ? animetFinalResult.isPartAnime
    : false;
  const hpandaIsPartAnime = hpandaFinalResult
    ? hpandaFinalResult.isPartAnime
    : false;
  const anime47IsPartAnime = anime47FinalResult
    ? anime47FinalResult.isPartAnime
    : false;
  const xemanimeIsPartAnime = xemanimeFinalResult
    ? xemanimeFinalResult.isPartAnime
    : false;
  const animetvnIsPartAnime = animetvnFinalResult
    ? animetvnFinalResult.isPartAnime
    : false;
  const animefullIsPartAnime = animefullFinalResult
    ? animefullFinalResult.isPartAnime
    : false;
  const returned_result = search_result.returned_result;
  const totalEps = returned_result.totalEps;
  const listOfEpisodesWithTitle = search_result.listOfEpisodesWithTitle;
  let animeazEpList;
  let vuianimeEpList;
  let animetEpList;
  let anime47EpList;
  let hpandaEpList;
  let animefullEpList;
  let xemanimeEpList;
  let animetvnEpList;
  let yugenEpList;
  let allanimeEpList;
  let gogoanimeEpList;
  let gogoanimeDubEpList;
  let animeowlEpList;
  let zoroEpList;
  let title_synonym_list = [];
  try {
    const title_english = search_result.returned_result.title_english;
    const title = search_result.returned_result.title;
    const findTitleSynonym = async () => {
      try {
        const result = await Promise.allSettled([
          findTextContent(page, "h1.details__card-title.show-on-t-m", false),
          findTextContent(page, "h2.details__card-stitle.show-on-t-m", false),
          findTextContent(page_animetvn, "h2.name-vi", false),
          findTextContent(page_animetvn, "h3.name-eng", false),
          findTextContent(page_hpanda, "h1.title.text-fff", false),
          title_english,
        ]);

        //This function determines if the "," position is before or after season number
        const findCommnaPosition = (str) => {
          let finalArray = [];
          let string = str
            .replaceAll(" II", " season 2")
            .replaceAll(" III", " season 3")
            .replaceAll(" IV", " season 4")
            .toLowerCase()
            .replaceAll("2nd season", "season 2")
            .replaceAll("3rd season", "season 3")
            .replaceAll("4th season", "season 4")
            .replaceAll("5th season", "season 5")
            .replaceAll("6th season", "season 6")
            .replaceAll("7th season", "season 7")
            .replaceAll("8th season", "season 8")
            .replaceAll("9th season", "season 9")
            .replaceAll("10th season", "season 10")
            .replaceAll("11th season", "season 11")
            .replaceAll("2nd part", "part 2")
            .replaceAll("ss2", "season 2")
            .replaceAll("ss 2", "season 2")
            .replaceAll("ss3", "season 3")
            .replaceAll("ss 3", "season 3")
            .replaceAll("ss4", "season 4")
            .replaceAll("ss 4", "season 4")
            .replaceAll("ss5", "season 5")
            .replaceAll("ss 5", "season 5")
            .replaceAll("ss5", "season 5")
            .replaceAll("ss 5", "season 5");
          //Capitalize every first word of the string
          string = string
            .split(" ")
            .map((word) => {
              return word[0].toUpperCase() + word.substring(1);
            })
            .join(" ");
          //Logic: we will find the part postion, and comma positon
          //Example : Đừng Chọc Anh Nữa Mà, Nagatoro! Phần 2,Don't Toy with Me, Miss Nagatoro 2nd Attack
          //If "," is before "Phần 2" like "Mà, Nagatoro!" we will pass it.
          //But if "," is after "Phần 2" like "Phần 2,Don't" we will split them apart.
          //After every split, we will remove that substring from string
          //Repart the process until the string is empty.
          while (string.length > 0) {
            // for (let i = 0; i < 4; i++) {

            const findSeasonPosition = (str) => {
              const seasonList = ["season", "mùa", "phần"];
              let firstMatchPosition = str.length;
              for (let el of seasonList) {
                if (
                  str
                    .toLowerCase()
                    //example: attack on titan final season part 2
                    //change final seson to season final so that when slice out "season" index, we will also remove the "final" out of the string
                    .replace("final season", "season final")
                    .includes(el)
                ) {
                  if (str.toLowerCase().indexOf(el) < firstMatchPosition) {
                    firstMatchPosition = str.toLowerCase().indexOf(el);
                  }
                }
              }
              if (firstMatchPosition !== str.length) return firstMatchPosition;
              else return -1;
            };
            const seasonPosition = findSeasonPosition(string);
            const findPartPosition = (str) => {
              //there are case title is "we are part of this family"
              //Therefore, we have to find out if there's number after "part"
              const isPart = str.toLowerCase().indexOf("part");
              if (isPart === -1) return -1; //If there is no "part"
              else {
                if (!isNaN(Number(str[isPart + 5]))) {
                  // if there is number after "part" => return the isPart position
                  return isPart;
                }
              }
            };
            const partPosition = findPartPosition(string);
            const findNumberPosition = (str) => {
              const numberList = [
                "2nd",
                "3rd",
                "4th",
                "5th",
                "6th",
                "7th",
                "8th",
              ];
              for (let el of numberList) {
                if (str.toLowerCase().includes(el)) {
                  return str.toLowerCase().indexOf(el);
                }
              }
              return -1;
            }; // example: Ijiranaide, Nagatoro-san 2nd Attack
            const numberPosition = findNumberPosition(string);
            const commaPosition = string.indexOf(",");

            const checkNextCommaPosition = () => {
              //Example: Don't Toy with Me, Miss Nagatoro, Please don't bully me, Nagatoro
              //We will replace the current comma with "*" to find the next comma;
              //Example current Comma is at between "Me, Miss" => the next nextCommaPosition will be between "Nagatoro, Please"
              const nextCommaPosition = string
                .replace(string[commaPosition], "*")
                .indexOf(",");

              //this function check subStringBeforeComma and subStringAfterComma length difference
              //if the difference in theiru length more than 2 we will put them as 2 seperate titles
              const checkSubStringsLengthDiff = (
                nextCommaPosition,
                subStringToNextComma
              ) => {
                const removeSeasonOrPartOrNumber = (str) => {
                  let finalStr = str;
                  const seasonPosition = findSeasonPosition(str);
                  const partPosition = findPartPosition(str);
                  const numberPosition = findNumberPosition(str);
                  if (seasonPosition !== -1) {
                    finalStr = str.slice(0, seasonPosition - 1);
                  } else if (partPosition !== -1) {
                    finalStr = str.slice(0, partPosition - 1);
                  } else if (numberPosition !== -1) {
                    finalStr = str.slice(0, numberPosition - 1);
                  }
                  return finalStr;
                };
                // example: Don't Toy with Me, Miss Nagatoro => subStringBeforeComma: Don't Toy with Me
                const subStringBeforeComma = removeSeasonOrPartOrNumber(
                  string.slice(0, commaPosition)
                );

                // example: Miss Nagatoro
                const subStringAfterComma = removeSeasonOrPartOrNumber(
                  string.slice(
                    commaPosition + 2,
                    nextCommaPosition !== -1 ? nextCommaPosition : string.length
                  )
                );

                //subStringBeforeComma length is longer or shorter than subStringAfterComma more tahn 2 words

                if (
                  subStringAfterComma.split(" ").length ===
                  subStringBeforeComma.split(" ").length
                ) {
                  for (let el of subStringToNextComma.split(",")) {
                    finalArray.push(el);
                  }
                } else {
                  //remove "," at the end of the string
                  const lastWord =
                    subStringToNextComma[subStringToNextComma.length - 1];
                  let subStringToBeAdded = subStringToNextComma;
                  if (lastWord === ",") {
                    subStringToBeAdded = subStringToNextComma.substring(
                      0,
                      subStringToNextComma.length - 1
                    );
                  }
                  finalArray.push(subStringToBeAdded);
                }

                string = string.replace(subStringToNextComma, "");
              };
              if (nextCommaPosition !== -1) {
                //example:Don't Toy with Me, Miss Nagatoro, Please don't bully me, Nagatoro

                const subStringToNextComma = string.slice(
                  0,
                  nextCommaPosition + 1
                );
                checkSubStringsLengthDiff(
                  nextCommaPosition,
                  subStringToNextComma
                );
              } else {
                //example:Don't Toy with Me, Miss Nagatoro, Please don't bully me, Nagatoro
                const subStringToNextComma = string.slice(0, string.length);
                checkSubStringsLengthDiff(
                  nextCommaPosition,
                  subStringToNextComma
                );
              }
            };
            if (commaPosition === -1) {
              return string;
            }
            if (
              seasonPosition !== -1 ||
              partPosition !== -1 ||
              numberPosition !== -1
            ) {
              if (
                (commaPosition > seasonPosition && seasonPosition > -1) ||
                (commaPosition > partPosition && partPosition > -1) ||
                (commaPosition > numberPosition && numberPosition > -1)
              ) {
                const subString = string.slice(0, commaPosition);

                finalArray.push(subString);
                string = string.replace(`${subString},`, "");
              } else {
                checkNextCommaPosition();
              }
            } else {
              checkNextCommaPosition();
            }
          }

          if (finalArray.length === 0) {
            return str;
          } else if (finalArray.length === 1) {
            return finalArray[0];
          } else if (finalArray.length > 1) {
            return finalArray;
          }
        };
        const title_ar = result
          .map((el, index) => {
            if (el.status === "fulfilled" && el.value && el.value !== "") {
              // if (index % 2 === 0) {
              //   return el.value;
              // } else {
              if (el.value.includes("|")) {
                return el.value
                  .trim()
                  .split("|")
                  .map((ele) => {
                    return findCommnaPosition(ele.trim());
                  });
              }
              return findCommnaPosition(el.value);
              // }
            }
          })
          .filter((el) => el !== undefined);

        for (let i of title_ar) {
          if (typeof i === "object") {
            for (let ele of i) {
              if (typeof ele === "object") {
                for (let element of ele) {
                  if (!title_synonym_list.includes(element)) {
                    title_synonym_list.push(element);
                  }
                }
              } else if (typeof ele === "string") {
                if (!title_synonym_list.includes(ele)) {
                  title_synonym_list.push(ele);
                }
              }
            }
          } else if (typeof i === "string") {
            if (!title_synonym_list.includes(i)) {
              title_synonym_list.push(i);
            }
          }
        }

        return title_synonym_list;
      } catch (e) {
        console.log("findTitleSynonymEr: " + e);
        return Array.from(new Set([title, title_english])); //only get one title, if title and tile_english are the same
      }
    };

    await Promise.allSettled([
      page.goto(animeazUrl, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      }),
      page_vuianime.goto(vuianimeUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_animet.goto(animetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_hpanda.goto(hpandaUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_anime47.goto(anime47Url, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_animefull.goto(animefullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_xemanime.goto(xemanimeUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_yugen.goto(yugenUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_allanime.goto(allanimeUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_gogo.goto(gogoanimeUrl, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_gogoanime_dub.goto(`${gogoanimeUrl}-dub`, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_animeowl.goto(`${animeowlUrl}`, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
      page_animetvn.goto(`${animetvnUrl}`, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      }),
    ]);

    //find the title_synonyms
    const titleSynonymList = await findTitleSynonym();
    returned_result["title_synonym"] = titleSynonymList;
    const findKeyWords = (titleSynonymList) => {
      try {
        const keywords = titleSynonymList.reduce((accumulator, value) => {
          for (let startIndex = 0; startIndex < value.length; startIndex++) {
            for (let endIndex = 1; endIndex <= value.length; endIndex++) {
              const substringTobeAdded = value
                .slice(startIndex, endIndex)
                .trim();
              if (
                substringTobeAdded &&
                !accumulator.includes(substringTobeAdded)
              ) {
                accumulator.push(
                  value.slice(startIndex, endIndex).toLowerCase().trim()
                );
              }
            }
          }
          return accumulator;
        }, []);
        return keywords;
      } catch (e) {
        console.log("findKeyWordsEr: " + e);
      }
    };

    //find keywords
    const keywords = findKeyWords(titleSynonymList);
    returned_result["keywords"] = keywords;

    //infoLinkList is an object includes animeazFinalResult, ..., but not include returned_result
    let infoLinkList = Object.fromEntries(
      Object.entries(search_result).filter(
        ([key]) =>
          key !== "returned_result" && key !== "listOfEpisodesWithTitle"
      )
    );
    returned_result["infoLinkList"] = infoLinkList;
    const episodesData = await Promise.allSettled([
      findAnimeazEps(page, animeazIsPartAnime, totalEps),
      findVuianimeEps(page_vuianime, vuianimeIsPartAnime, totalEps),
      findAnimetEps(page_animet, animetIsPartAnime, totalEps),
      findHpandaEps(page_hpanda, hpandaIsPartAnime, totalEps),
      findAnime47Eps(page_anime47, anime47IsPartAnime, totalEps),
      findAnimefullEps(page_animefull, animefullIsPartAnime, totalEps),
      findXemanimeEps(page_xemanime, xemanimeIsPartAnime, totalEps),
      findAnimetvnEps(page_animetvn, animetvnIsPartAnime, totalEps),
      findYugenEps(page_yugen),
      findAllanimeEps(page_allanime),
      findGogoanimeEps(page_gogo),
      findGogoanimeEps(page_gogoanime_dub),
      findAnimeowlEps(page_animeowl),
      findZoroEps(zoroFinalResult),
    ]);
    animeazEpList = episodesData[0].value;
    vuianimeEpList = episodesData[1].value;
    animetEpList = episodesData[2].value;
    hpandaEpList = episodesData[3].value;
    anime47EpList = episodesData[4].value;
    animefullEpList = episodesData[5].value;
    xemanimeEpList = episodesData[6].value;
    animetvnEpList = episodesData[7].value;
    yugenEpList = episodesData[8].value;
    allanimeEpList = episodesData[9].value;
    gogoanimeEpList = episodesData[10].value;
    gogoanimeDubEpList = episodesData[11].value;
    animeowlEpList = episodesData[12].value;
    zoroEpList = episodesData[13].value;
    console.log(episodesData);
    console.log("animeazEpList: ");
    console.log(animeazEpList);
    console.log("vuianimeEpList:");
    console.log(vuianimeEpList || []);
    console.log("animetEpList: ");
    console.log(animetEpList);
    console.log("hpandaEpList: ");
    console.log(hpandaEpList);
    console.log("anime47EpList: ");
    console.log(anime47EpList);
    console.log("animefullEpList: ");
    console.log(animefullEpList);
    console.log("yugenEpList: ");
    console.log(yugenEpList);
    console.log("allanimeEpList: ");
    console.log(allanimeEpList);
    console.log("gogoanimeEpList: ");
    console.log(gogoanimeEpList);
    console.log("gogoanimeDubEpList: ");
    console.log(gogoanimeDubEpList);
    console.log("animeowlEpList: ");
    console.log(animeowlEpList);
    console.log("xemanimeEpList: ");
    console.log(xemanimeEpList);
    console.log("animetvnEpList: ");
    console.log(animetvnEpList);
    console.log("zoroEpList: ");
    console.log(zoroEpList);
  } catch (er) {
    console.log("info_error: " + er);
  } finally {
    const info_result = {
      animeazEpList,
      vuianimeEpList,
      animetEpList,
      hpandaEpList,
      anime47EpList,
      animefullEpList,
      xemanimeEpList,
      animetvnEpList,
      yugenEpList,
      allanimeEpList,
      gogoanimeEpList,
      gogoanimeDubEpList,
      animeowlEpList,
      zoroEpList,
      returned_result,
      listOfEpisodesWithTitle,
    };
    await axios.post("http://127.0.0.1:8080/fastify/video", { info_result });
  }
};
export default findEpLists;
