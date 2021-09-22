const puppeteer = require("puppeteer");
const logg = require("./logging");
const constants = require('../properties/constants')


class ScrapContent {
  constructor(url) {
    this.url = url
  }
  async getPageDetails() {
    try {
      logg.log("SCRAPPER SAYS HELLO");
      const blocked_domains = ["googlesyndication.com", "adservice.google.com"];
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = request.url();
        if (blocked_domains.some((domain) => url.includes(domain))) {
          request.abort();
        } else {
          request.continue();
        }
      });
      await page.goto(this.url);
      
      let data1 = await page.evaluate(() => {
        if (!document.querySelector(".pdp-info>h1")) {
          throw "INVALID_URL";
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
  
      await browser.close();
      return data1;
    } catch (err) {
      if(err.toString().includes(constants.commonResponseMessages.INVALID_URL)) {
        throw constants.commonResponseMessages.INVALID_URL
      } else {
        console.log(err)
        throw constants.commonResponseMessages.SOMETHING_WENT_WRONG
      }
    }
  }
  async extractReviews() {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
  
      await page.goto(this.url, {
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
              review_date: elements.children[0].children[1].children[3].innerText,
              comment: elements.children[1].innerText.replaceAll("\n", ""),
            });
          }
        });
        return dataSet;
      });
      await browser.close();
      return comments;
    } catch (err) {
      logg.log("error in data fetch", err);
      throw constants.commonResponseMessages.SOMETHING_WENT_WRONG
    }
  }
}

module.exports = ScrapContent