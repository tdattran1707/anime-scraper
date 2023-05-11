import axios from "axios";
import { load } from "cheerio";
import {
  findBestTitleInArray,
  findConditionName,
  findSearchTitle,
} from "../../utils/utils";
import puppeteer from "puppeteer";
export async function findBestAnimeazResult(title, title_english) {
  //Find Search Title
  const jSearchTitle = findSearchTitle(title);
  const enSearchTitle = title_english
    ? findSearchTitle(title_english)
    : findConditionName(title);
  const backupSearchTitle = title.split(" ")[0];
  const baseURL = "https://animeaz.me/";
  const site_address = `${baseURL}?q=${jSearchTitle}`;
  const backup_site_address = `${baseURL}?q=${enSearchTitle}`;
  const backup_site_address2 = `${baseURL}?q=${backupSearchTitle}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--devtools-flags=disable",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-site-isolation-trials",
      `--window-size=1920,1080`,
      "--disable-ads",
    ],
    ignoreHTTPSErrors: true,
    dumpio: false,
  });
  const page = (await browser.pages())[0];
  const findBackupBestResult = async () => {
    try {
      const listOfURLs = [
        site_address,
        backup_site_address,
        backup_site_address2,
      ];
      const findBackupTitleAndLinkList = async (site_address) => {
        try {
          await page.goto(site_address, {
            waitUntil: "domcontentloaded",
            timeout: 20000,
          });
          await page.waitForSelector(
            "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div.gsc-resultsRoot.gsc-tabData.gsc-tabdActive > div > div.gsc-expansionArea > div > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a",
            { waitUntil: "domcontentloaded", timeout: 20000 }
          );
          const title_and_link_list = await page.$$eval(
            "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div.gsc-resultsRoot.gsc-tabData.gsc-tabdActive > div > div.gsc-expansionArea > div > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a",
            (data) => {
              return data.map((el) => {
                return {
                  link: el.getAttribute("data-ctorig"),
                  title_list: [el.textContent.replace(" VietSub HD", "")],
                  total_eps: null,
                };
              });
            }
          );
          return title_and_link_list;
        } catch (e) {
          console.log("findBackupTitleAndLinkListEr: " + e);
          return [];
        }
      };
      let best_result;
      for (let site_address of listOfURLs) {
        const title_and_link_list = await findBackupTitleAndLinkList(
          site_address
        );
        console.log("animeaz_title_and_link_list:");
        console.log(title_and_link_list);
        if (!title_and_link_list || title_and_link_list.length === 0) {
          continue;
        }
        best_result = findBestTitleInArray(title_and_link_list, title_synonym);
        if (best_result) break;
      }
      return best_result || null;
    } catch (e) {
      console.log("findAnimeazBackupBestResultEr: " + e);
      return null;
    }
  };
  //Find anime list
  const searchResult = await Promise.allSettled([
    axios.get(site_address),
    axios.get(backup_site_address),
    axios.get(backup_site_address2),
  ]);
}
