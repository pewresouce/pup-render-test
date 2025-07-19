const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const UserAgent = require("user-agents");
const express = require("express");
const moment = require("moment-timezone");
const port = process.env.PORT || 5002;
let iteration = 1;

const app = express();

app.listen(port, () => {
  console.log(`Server is running on port ${port}\nhttps://pup-render-test.onrender.com`);
});

app.get("/", (req, res) => {
  let r =
    `Server is running...\n\n` + `Program has made ${iteration} iterations`;
  res.end(r);
});

async function example() {
  try {
    const browser = await puppeteer.launch({
      headless: true, //set to true in production
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--single-process",
      ],
      ignoreHTTPSErrors: true,
      executablePath: process.env.CHROME_BIN || puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    // remove timeout limit
    page.setDefaultNavigationTimeout(0);
    const userAgent = new UserAgent({ deviceCategory: "desktop" });
    const randomAgent = userAgent.toString();
    await page.setUserAgent(randomAgent);
    await page.goto("https://www.example.com/", {
      waitUntil: "domcontentloaded",
    });
    let h1 = await page.$eval("h1", (x) => {
      return x.textContent.trim();
    });
    await browser.close();
    console.log("browser closed");
    iteration++;
    return h1;
  } catch (error) {
    console.error(error);
  }
}

let rc = async () => {
  let timeZone = "Africa/Lagos";
  let now = moment.tz(timeZone);

  let t1 = now.clone().set({ hour: 12, minute: 0, second: 0 });
  let t2 = now.clone().set({ hour: 13, minute: 0, second: 0 });

  setTimeout(async () => {
    if (now.isBetween(t1, t2)) {
      console.log("Within 7am - 8am time interval");
      let ex = await example();
      if (ex != undefined) {
        console.log(ex);
        console.log(`starting new iteration...${iteration}`);
      }
    } else {
      console.log("Not within 7am - 8am time interval");
    }
    await rc();
  }, 20000); // 38 minutes in milliseconds
};

rc();
