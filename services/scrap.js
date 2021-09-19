const puppeteer = require("puppeteer");
const logg = require("./logging");

async function getData(url) {
  try {
    const extractComments = async (url) => {
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle2",
      });
      const comments = await page.evaluate(() => {
        let onPageReviews = [];
        onPageReviews = document.getElementsByClassName("review");
        let dataSet = [];
        onPageReviews.forEach((elements, i) => {
          if (i > 0) {
            dataSet.push({
              rating:
                elements.children[0].children[0].children[1].children[0]
                  .children[1].innerText,
              reviewer:
                elements.children[0].children[1].children[1].innerText == ","
                  ? "NO_NAME"
                  : elements.children[0].children[1].children[1].innerText,
              review_date:
                elements.children[0].children[1].children[3].innerText,
              comment: elements.children[1].innerText.replaceAll("\n", ""),
            });
          }
        });
        return dataSet;
      });
      return comments;
    };
    logg.log("SCRAPPER SAYS HELLO");
    const blocked_domains = [
        'googlesyndication.com',
        'adservice.google.com',
    ];
    const minimal_args = [
        '--autoplay-policy=user-gesture-required',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
      ];
    // const browser = await puppeteer.launch({ headless: true });
    // cache fills up heroku creates issues
    // const browser = await puppeteer.launch({
    //     headless: true,
    //     args : minimal_args,
    //     userDataDir: './cache'
    // });
    const browser = await puppeteer.launch({
        headless: true,
        args : minimal_args,
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true)
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url()
      if (blocked_domains.some(domain => url.includes(domain))) {
        request.abort();
      } else {
        request.continue();
      }
    });
    // wait untill tells the browser that the navigation is finished when thr are atmost 2 network connection over half a second
    await page.goto(url);

    let data1 = await page.evaluate(() => {
      if(!document.querySelector(".pdp-info>h1")) {
        throw "Invalid url";
      }
      let product_name = document.querySelector(".pdp-info>h1").innerText;
      let overall_rating = document.querySelector(".with-review>.score");

      let str = document.querySelector(".reviewsPagination>.reviewPage");
      let reviews = [];

      let num_reviews_string_arr = [];

      if (overall_rating) {
        overall_rating = overall_rating.innerText;
      } else {
        overall_rating = "NOT_RATED";
      }
      if (str) {
        str = str.innerText;
        num_reviews_string_arr = str.match(/(\d+)/g);
      }

      let num_reviews_per_page = 0;
      let total_pages = 0;
      let total_reviews = 0;
      if (num_reviews_string_arr.length) {
        num_reviews_per_page =
          num_reviews_string_arr[num_reviews_string_arr.length - 2];
        total_reviews =
          num_reviews_string_arr[num_reviews_string_arr.length - 1];
        total_pages = Math.ceil(total_reviews / num_reviews_per_page);
      }

      return {
        product_name,
        overall_rating,
        num_reviews_per_page,
        total_reviews,
        total_pages,
        reviews,
      };
    });

    let masterSet = [];
    let comments = [];
    for (let x = 0; x < data1.total_pages; x++) {
      comments = await extractComments(url + `&pagenumber=${x}`);
      masterSet.push(...comments);
    }

    await browser.close();
    data1.reviews = masterSet;
    logg.log("Product data", data1);
    return data1;
  } catch (err) {
    logg.log("error in data fetch", err);
    throw err
  }
}

module.exports = {
  getData,
};
