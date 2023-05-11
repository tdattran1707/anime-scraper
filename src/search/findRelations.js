export const findRelations = async (page, title_synonym) => {
  //this function chekc is the anime is a movie, a season, or a part anime, ex: bleach movie 1, bleach season 2, bleach part 2 ....
  try {
    const getTitleFromSpecialForm = () => {
      const isFilm = title_synonym.toLowerCase().search("film");
      const isMovie = title_synonym.toLowerCase().search("movie");
      const isSeason = title_synonym.toLowerCase().search("season");
      //If the anime is Part anime, this should be handled more carefully;
      //Because example: title is Part of Me => we should look for something like Part of me Part 2
      let isPart = -1;
      //Check if the anime is specail. Example: Sword Art Online: Extra Edition => Here; the ":" indicates that the title is special
      const isSpecial = title_synonym.toLowerCase().search(/:|!|-/); //finding ":", "?", and  "-""

      const hasPartInTitle = title_synonym.toLowerCase().includes("part");
      if (hasPartInTitle) {
        const part_position = title_synonym.toLowerCase().search("part");
        const isNumberAfterPart = title_synonym[part_position + 5]; //ex: bleach part 2
        if (!isNaN(Number(isNumberAfterPart))) isPart = part_position;
      }
      let search_title = title_synonym;
      if (isFilm !== -1) search_title = title_synonym.slice(0, isFilm);
      else if (isMovie !== -1) search_title = title_synonym.slice(0, isMovie);
      else if (isSpecial !== -1)
        search_title = title_synonym.slice(0, isSpecial);
      else if (isPart !== -1) search_title = title_synonym.slice(0, isPart);
      else if (isSeason !== -1) search_title = title_synonym.slice(0, isSeason);
      return search_title;
    };
    const relation_title = getTitleFromSpecialForm();
    const findMyAnimeListInfo = async (title) => {
      try {
        const myanimelist_title = !title.includes("86")
          ? title
          : title + "eighty six";
        const myanimelist_url = `https://myanimelist.net/anime.php?q=${myanimelist_title}&cat=anime`;
        await page.goto(myanimelist_url, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        const find_img_list = async () => {
          await page.waitForSelector(".hoverinfo_trigger > img", {
            visible: true,
          });
          const img_list = await page.$$eval(
            ".hoverinfo_trigger > img",
            (data) => {
              return data.map(
                (el) => el.getAttribute("data-srcset") || ele.currentSrc
              );
            }
          );
          return img_list;
        };
        const find_title_and_id_list = async () => {
          await page.waitForSelector(".hoverinfo_trigger.fw-b.fl-l");
          const title_and_id_list = await page.$$eval(
            ".hoverinfo_trigger.fw-b.fl-l",
            (data) => {
              return data.map((el) => {
                return {
                  id: el.id.replace("sinfo", ""),
                  title: el.textContent,
                };
              });
            }
          );
          return title_and_id_list;
        };
        const findInfoResult_list = async () => {
          let info_list = [];
          for (let i = 0; i < 50; i++) {
            const find_type = async () =>
              await page.$eval(
                `#content > div.js-categories-seasonal.js-block-list.list > table > tbody > tr:nth-child(${
                  i + 2
                }) > td:nth-child(3)`,
                (data) => data.textContent.replace(/\r?\n|\r/g, "").trim()
              );
            const find_episodes = async () =>
              await page.$eval(
                `#content > div.js-categories-seasonal.js-block-list.list > table > tbody > tr:nth-child(${
                  i + 2
                }) > td:nth-child(4)`,
                (data) => data.textContent.replace(/\r?\n|\r/g, "").trim()
              );
            const info = await Promise.all([find_type(), find_episodes()]);
            const type = info[0];
            const episodes = info[1];
            info_list.push({
              type,
              episodes,
            });
          }
          return info_list;
        };
        const info = await Promise.allSettled([
          find_img_list(),
          findInfoResult_list(),
          find_title_and_id_list(),
        ]);
        const img_list = info[0].value;
        const info_list = info[1].value;
        const title_list = info[2].value;
        let final_list = [];
        info_list.map((el, index) => {
          const type_list = ["special", "ova", "ona"];
          if (!type_list.includes(el.type.toLowerCase()) && el.episodes !== "-")
            final_list.push({
              id: title_list[index].id,
              title: title_list[index].title,
              type: el.type,
              episodes: el.episodes,
              img: img_list[index],
            });
        });
        return final_list;
      } catch (e) {
        console.log("findMyAnimeListInfoEr: " + e);
      }
    };
    const results = await findMyAnimeListInfo(relation_title);
    let list = []; //list contains relation anime
    const findTitleMatchPercentage = (title) => {
      try {
        const condition_query = relation_title
          .toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, "");

        const condition_query_split = condition_query.split(" ");
        const relation_title_split = relation_title.split(" ");
        const condition_title = title
          .toLowerCase()
          .replace("the movie", "movie")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace("2nd season", "season 2")
          .replace("3rd season", "season 3")
          .replace("4th season", "season 4")
          .replace("5th season", "season 5")
          .replace("6th season", "season 6")
          .replace("7th season", "season 7")
          .replace("8th season", "season 8")
          .trim();
        const condition_title_split = condition_title.split(" ");
        let match_point = 0;
        for (let i = 0; i < condition_query_split.length; i++) {
          if (condition_title_split[i] === condition_query_split[i])
            match_point++;
        }
        const title_match_percentage =
          match_point / relation_title_split.length;
        return title_match_percentage;
      } catch (e) {
        console.log("findTitleMatchPercentageEr: " + e);
        return 0;
      }
    };
    const addDataToRelationList = (data) => {
      list.push({
        title: data.title,
        id: data.id,
        img: data.img,
        type: data.type.replace("anime", "TV"),
        episodes: data.episodes,
      });
    };

    for (let el of results) {
      const first_word_in_title = el.title
        .replace("Fate/", "fate ")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .shift()
        .toLowerCase();
      const first_word_in_query = relation_title
        .replace("Fate/", "fate ")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .shift()
        .toLowerCase();

      let title_match_percentage = findTitleMatchPercentage(el.title);
      if (
        relation_title.toLowerCase().includes("naruto") ||
        relation_title.toLowerCase().includes("boruto")
      ) {
        if (
          el.title.toLowerCase().includes("boruto") ||
          title_match_percentage >= 0.5 ||
          el.title.toLowerCase().includes("naruto")
        ) {
          addDataToRelationList(el);
        }
      } else if (title_synonym.toLowerCase().includes("fate/")) {
        if (
          el.title.toLowerCase().includes("fate/stay") ||
          el.title.toLowerCase().includes("fate/zero") ||
          el.title.toLowerCase().includes("fate/grand") ||
          el.title.toLowerCase().includes("fate/extra") ||
          el.title.toLowerCase().includes("fate/apocrypha") ||
          title_match_percentage >= 0.7
        ) {
          addDataToRelationList(el);
        }
      } else {
        if (
          first_word_in_query === first_word_in_title &&
          title_match_percentage >= 0.5
        )
          addDataToRelationList(el);
      }
    }
    return list;
  } catch (e) {
    console.log("findRelationsEr: " + e);
    return [];
  }
};
