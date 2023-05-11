import dotenv from "dotenv";
import algoliasearch from "algoliasearch";
dotenv.config({ path: "/Users/dattran/Documents/anime-scaper/.env" });

const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;

// const ALGOLIA_API_KEY = "79f843588eaee69915c02822d0e44ebb";
// const ALGOLIA_APP_ID = "YTNL4OHFMF";
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
export const algoliaIndex = client.initIndex("anime");
