import {
  findTitleAndLinkList,
  findBestTitleInArray,
} from "../../../utils/utils.js";

export const findSearchModel = async (searchOpts) => {
  try {
    const {
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
    } = searchOpts;
    const title_and_link_list = await findTitleAndLinkList(
      page,
      site_address,
      title_option,
      link_elem,
      episode_elem,
      backup_site_address,
      title_backup_option,
      backup_site_address2
    );
    if (!title_and_link_list || title_and_link_list.length === 0) {
      return null;
    }
    const best_result = findBestTitleInArray(
      title_and_link_list,
      title_synonym,
      title_english
    );
    return best_result || null;
  } catch (e) {
    console.log("findSearchModelEr: " + e);
    return null;
  }
};
