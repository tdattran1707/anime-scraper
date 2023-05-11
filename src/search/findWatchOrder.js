import { findAttributeContent, findTextContent } from "../../utils/utils.js";
export const findWatchOrder = async (id, page) => {
  let final_watch_order_data;
  try {
    await page.goto(`https://chiaki.site/?/tools/watch_order/id/${id}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    const mal_id_elem = "#wo_list > tbody > tr";
    const anilist_id_elem = "#wo_list > tbody > tr";
    const img_elem = "#wo_list > tbody > tr > td:nth-child(1) > div";
    const title_elem =
      "#wo_list > tbody > tr > td.uk-text-middle > span.wo_title";
    const english_title_elem =
      "#wo_list > tbody > tr > td.uk-text-middle > span:nth-of-type(2)";
    const episode_elem =
      "#wo_list > tbody > tr > td.uk-text-middle > span.uk-text-muted.uk-text-small";
    const result = await Promise.allSettled([
      findAttributeContent(page, mal_id_elem, "data-id"),
      findAttributeContent(page, anilist_id_elem, "data-anilist-id"),
      findAttributeContent(page, img_elem, "style"),
      findTextContent(page, title_elem),
      findTextContent(page, english_title_elem),
      findTextContent(page, episode_elem),
    ]);
    const mal_id_list = result[0].value;
    const anilist_id_list = result[1].value;
    const img_list = result[2].value;
    const title_list = result[3].value;
    const english_title_list = result[4].value;
    const episode_list = result[5].value;
    let watch_order_data = [];
    for (let i = 0; i < mal_id_list.length; i++) {
      watch_order_data.push({
        mal_id: mal_id_list[i],
        anilist_id: anilist_id_list[i],
        img: `https://chiaki.site/${img_list[i]
          .replace("background-image:url", "")
          .replace(/"/g, "")
          .replace(/'/g, "")
          .replace(/\(|\)/g, "")}`,
        title: title_list[i],
        title_english: english_title_list[i].includes("episodes")
          ? ""
          : english_title_list[i],
        total_eps: episode_list[i].split("|")[2].split("×").shift().trim(),
        duration: episode_list[i].split("|")[2].split("×").pop().trim(),
        type: episode_list[i].split("|")[1].trim(),
      });
    }
    const type_list = ["TV", "Movie"];
    final_watch_order_data = watch_order_data.filter(({ type }) =>
      type_list.includes(type)
    );
  } catch (e) {
    console.log("getWatchOrder_er: " + e);
  } finally {
    return final_watch_order_data.some(
      ({ mal_id }) => Number(mal_id) === Number(id)
    )
      ? final_watch_order_data
      : [];
  }
};
