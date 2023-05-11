export async function findEps(
  page,
  watch_btn_elem,
  list_of_eps_elem,
  ep_num_elem = null,
  isPartAnime,
  totalEps
) {
  let anime_episodes_list;
  try {
    setTimeout(() => {
      console.log("findEps Stucks for 40 seconds");
      return anime_episodes_list || [];
    }, 40000);
    const watch_button = await page.$eval(watch_btn_elem, (data) => {
      return data.href;
    });
    console.log("watch_button: " + watch_button);
    await page.goto(watch_button, {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });
    await page.waitForSelector(list_of_eps_elem, { timeout: 10000 });
    anime_episodes_list = await page.$$eval(
      list_of_eps_elem,
      (data, ep_num_elem) =>
        data.map((el) => {
          return {
            ep_num: ep_num_elem
              ? el
                  .getAttribute(ep_num_elem)
                  .split("/")
                  .pop()
                  .toLowerCase()
                  .replace("tập", "")
                  .replace("_end", "")
                  .replace("end", "")
                  .replace("Ep", "")
                  .trim()
              : el.textContent
                  .split("/")
                  .pop()
                  .toLowerCase()
                  .replace("Tập", "")
                  .replace("_end", "")
                  .replace("end", "")
                  .replace("Ep", "")
                  .trim(),
            ep_link: el.href,
          };
        }),
      ep_num_elem
    );
    if (isPartAnime && anime_episodes_list) {
      const total_eps_of_part_2 = Number(totalEps);
      //Because at animet site, part-2 anime is merged into part-1, ex: spy x family part 2 is merged into spy x family
      //=> total_eps_of_part_2 of anime_episodes_list could be 20 (for both parts)
      //Find just episodes of part 2
      const total_eps_of_part_1 =
        anime_episodes_list.length - total_eps_of_part_2;
      const first_ep_of_part_2 = total_eps_of_part_1 + 1;
      anime_episodes_list = anime_episodes_list.filter(({ ep_num }) => {
        return Number(ep_num) >= first_ep_of_part_2;
      });
      anime_episodes_list = anime_episodes_list.map(({ ep_num, ep_link }) => {
        return {
          ep_num: ep_num.replace(
            ep_num,
            (Number(ep_num) - total_eps_of_part_1).toString()
          ),
          ep_link: ep_link,
        };
      });
    }
  } catch (er) {
    console.log("findEps_er: " + e);
  } finally {
    return anime_episodes_list;
  }
}
