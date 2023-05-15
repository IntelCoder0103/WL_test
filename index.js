require("dotenv").config();

const { scrapeWL } = require("./scrapeWL");

(async () => {
  products = await scrapeWL();
  console.log(products);
})();
