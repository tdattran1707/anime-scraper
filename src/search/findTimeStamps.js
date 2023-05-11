import axios from "axios";

export const findTimeStamps = async (id, total_eps) => {
  try {
    const time_stamps = [];
    for (let i = 0; i < Number(total_eps); i++) {
      const episode_time_stamp_link = `https://api.aniskip.com/v2/skip-times/${id}/${
        i + 1
      }?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=0`;
      const find_time_stamps_data = async () => {
        try {
          const response = await axios.get(episode_time_stamp_link);
          return response;
        } catch (e) {
          return {
            data: {
              results: [],
            },
          };
        }
      };
      const response = await find_time_stamps_data();
      const result = response.data;
      const time_stamp_data = result.results;
      time_stamps.push({
        ep_num: i + 1,
        time_stamp: time_stamp_data || [],
      });
    }
    return time_stamps;
  } catch (e) {
    console.log(e);
    return [];
  }
};
