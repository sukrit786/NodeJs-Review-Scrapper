const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const port = 3000;
config = require("config");
const env = "dev";
const logg = require("./services/logging");
const scrapi = require("./services/scrap");
const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];
const responses = require("./services/responses");
const constants = require("./properties/constants");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
logg.log("SERVER FILE SAYS", "happy bday santa");

app.get("/", (req, res) => {
  res.send("this is just a view file");
});

// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=640254&CatId=3839 3_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=6659197&CatId=5469 41_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=54563&CatId=3839 no_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=995645234&CatId=3839 invalid_url

app.post("/url", async (req, res) => {
  let msg = "";
  try {
    // const browser = await puppeteer.launch({ headless: true });
    // cache fills up heroku creates issues
    // const browser = await puppeteer.launch({
    //     headless: true,
    //     args : minimal_args,
    //     userDataDir: './cache'
    // });
    let page_details = await scrapi.getPageDetails(req.body.url);
    req.body.page_details = page_details;
    let promiseArray = [];
    if (req.body.page_details.total_reviews == 0) {
        return responses.sendCustomSuccessResponse(
            res,
            req.body.page_details,
            constants.responseCodes.SUCCESS,
            constants.commonResponseMessages.NO_REVIEWS_FOUND
        );
    } else {
      for (let x = 0; x < req.body.page_details.total_pages; x++) {
        promiseArray.push(
          scrapi.extractReviews(req.body.url + `&pagenumber=${x}`)
        );
      }
      let reviews = [];
      await Promise.all(promiseArray)
        .then((out) => {
          reviews = out;
        })
        .catch((err) => {
          throw constants.commonResponseMessages.ERROR_FETCHING_REVIEWS;
        });
      //flat does'nt work '_'
      reviews.forEach((el) => {
        req.body.page_details.reviews.push(...el);
      });
    }
    return responses.sendCustomSuccessResponse(
      res,
      req.body.page_details,
      constants.responseCodes.SUCCESS,
      constants.commonResponseMessages.SUCCESS
    );
  } catch (err) {
    logg.logError("error_while_scraping", err);
    return responses.sendCustomErrorResponse(
      res,
      constants.responseCodes.SOMETHING_WENT_WRONG,
      err,
      {}
    );
  }
});

app.listen(process.env.PORT || config.get("port"), () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
