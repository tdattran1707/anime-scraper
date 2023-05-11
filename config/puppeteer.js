import pup from "puppeteer";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

dotenv.config();
//Make headless browser (puppeteer) be more like a normal browser => not getting blocked by some special sites
puppeteer.use(StealthPlugin());

//using adblock for puppeteer
puppeteer.use(
  AdblockerPlugin({
    interceptResolutionPriority: pup.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
  })
);
puppeteer.use(AdblockerPlugin({ blocdckTrackers: true }));

export async function createPages() {
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

  let promiseList = [];
  for (let i = 0; i < 17; i++) {
    promiseList.push(browser.newPage());
  }
  const pages = await Promise.all(promiseList);
  //Page for animelist
  const page_myanimelist = (await browser.pages())[0];
  //Page for relations
  const page_relation = pages[0];
  //Pages for Vietsub
  const page = pages[1];
  const page_vuianime = pages[2];
  const page_animet = pages[3];
  const page_hpanda = pages[4];
  const page_anime47 = pages[5];
  const page_animefull = pages[6];
  const page_xemanime = pages[7];
  const page_animetvn = pages[8];
  //Pages_for_anime_details
  const page_watch_order = pages[9];
  const page_vuighe = pages[10];
  //Pages for engsub
  const page_yugen = pages[11];
  const page_gogo = pages[12];
  const page_animeowl = pages[13];
  const page_gogoanime_dub = pages[14];
  const page_allanime_dub = pages[15];
  const page_allanime = pages[16];
  return {
    browser,
    page_myanimelist,
    page_relation,
    page,
    page_vuianime,
    page_animet,
    page_hpanda,
    page_anime47,
    page_animefull,
    page_xemanime,
    page_animetvn,
    page_watch_order,
    page_vuighe,
    page_yugen,
    page_gogo,
    page_animeowl,
    page_gogoanime_dub,
    page_allanime_dub,
    page_allanime,
  };
}
