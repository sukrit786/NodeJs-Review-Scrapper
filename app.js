const express = require("express");
var bodyParser = require("body-parser");
const app = express();
config = require("config");
const env = "dev";
const logg = require("./services/logging");
const ScrapContent = require("./services/scrap");
const Response = require("./services/responses");
const constants = require("./properties/constants");


// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=640254&CatId=3839 3_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=6659197&CatId=5469 41_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=54563&CatId=3839 no_reviews
// https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=995645234&CatId=3839 invalid_url
// the code formatting is based of my very limited knowledge of SRP architecture

class Server {
	constructor(port, app) {
		this.port = port;
		this.app = app;
	}
    getRoutes() {
		this.app.get("/", (req, res) => {
            res.send("this is just a view file");
        });
    }
    postRoutes() {

        this.app.post("/url", async (req, res) => {
            try {
              // const browser = await puppeteer.launch({ headless: true });
              // cache fills up heroku creates issues
              // const browser = await puppeteer.launch({
              //     headless: true,
              //     args : minimal_args,
              //     userDataDir: './cache'
              // });
              let page_details = await new ScrapContent(req.body.url).getPageDetails()
              req.body.page_details = page_details;
              let promiseArray = [];
              if (req.body.page_details.total_reviews == 0) {
                return new Response(
                    res,
                    req.body.page_details,
                    constants.responseCodes.SUCCESS,
                    constants.commonResponseMessages.NO_REVIEWS_FOUND
                ).sendCustomSuccessResponse();
              } else {
                for (let x = 0; x < req.body.page_details.total_pages; x++) {
                  promiseArray.push(
                    await new ScrapContent(req.body.url + `&pagenumber=${x}`).extractReviews()
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
              return new Response(
                res,
                req.body.page_details,
                constants.responseCodes.SUCCESS,
                constants.commonResponseMessages.SUCCESS
              ).sendCustomSuccessResponse();
            } catch (err) {
              logg.logError("error_while_scraping", err);
              return new Response(
                res,{},
                constants.responseCodes.SOMETHING_WENT_WRONG,
                err
              ).sendCustomErrorResponse();
            }
        });
    }
	core() {
        logg.log("SERVER FILE SAYS SRP trial", "happy bday santa");
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
		this.app.listen(this.port,() =>{ logg.log(`http://localhost:${this.port}`);});
	}
}

let server = new Server(process.env.PORT||config.get('port'), express());
server.core();
server.getRoutes();
server.postRoutes();