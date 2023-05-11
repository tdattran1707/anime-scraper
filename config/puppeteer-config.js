import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import pup from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
//Make headless browser (puppeteer) be more like a normal browser => not getting blocked by some special sites
// puppeteer.use(StealthPlugin());

// //using adblock for puppeteer
// puppeteer.use(
//   AdblockerPlugin({
//     interceptResolutionPriority: pup.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
//   })
// );
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export const browser = await pup.launch({
  headless: "new",
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
// try {
//   //run on Docker
//   browser = await puppeteer.launch({
//     headless: true,
//     executablePath: "/usr/bin/google-chrome-stable",
//     args: [
//       "--disable-gpu",
//       // "--incognito",
//       "--devtools-flags=disable",
//       "--disable-dev-shm-usage",
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-web-security",
//       "--disable-features=IsolateOrigins,site-per-process",
//       "--disable-site-isolation-trials",
//       `--window-size=1920,1080`,
//       "--disable-ads",
//     ],
//     ignoreHTTPSErrors: true,
//     dumpio: false,
//   });
// } catch (e) {
//   //run on local machine
//   browser = await puppeteer.launch({
//     headless: true,
//     executablePath: process.env.CHROMIUM_LOCAL_EXECUTABLE_PATH,
//     args: [
//       "--disable-gpu",
//       // "--incognito",
//       "--devtools-flags=disable",
//       "--disable-dev-shm-usage",
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-web-security",
//       "--disable-features=IsolateOrigins,site-per-process",
//       "--disable-site-isolation-trials",
//       `--window-size=1920,1080`,
//       "--disable-ads",
//     ],
//     ignoreHTTPSErrors: true,
//     dumpio: false,
//   });
// }
//Page for animelist
export const page_myanimelist = (await browser.pages())[0];
//Page for relations
export const page_relation = await browser.newPage();
//Pages for Vietsub
export const page = await browser.newPage();
export const page_vuianime = await browser.newPage();
export const page_animet = await browser.newPage();
export const page_hpanda = await browser.newPage();
export const page_anime47 = await browser.newPage();
export const page_animefull = await browser.newPage();
export const page_xemanime = await browser.newPage();
export const page_animetvn = await browser.newPage();
//Pages_for_anime_details
export const page_watch_order = await browser.newPage();
export const page_vuighe = await browser.newPage();
//Pages for engsub
export const page_yugen = await browser.newPage();
export const page_gogo = await browser.newPage();
export const page_animeowl = await browser.newPage();
export const page_gogoanime_dub = await browser.newPage();
export const page_allanime_dub = await browser.newPage();
export const page_allanime = await browser.newPage();



