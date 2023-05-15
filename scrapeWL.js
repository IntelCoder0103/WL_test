const fetch = require("node-fetch");
const cheerio = require("cheerio");

const PRODUCT_URL =
  process.env.PRODUCT_URL || "https://wltest.dns-systems.net/";

const _sortProducts = (products) => {
  return products.sort((productA, productB) => {
    const priceA = Number(productA.price?.replace(/[^0-9.-]+/g, ""));
    const priceB = Number(productB.price?.replace(/[^0-9.-]+/g, ""));
    
    return priceB - priceA;
  });
};
const scrapeWL = async (sortProducts = _sortProducts) => {
  const response = await fetch(PRODUCT_URL);

  if (response.status != 200) throw new Error("Error fetching webpage");
  const html = await response.text();
  
  const $ = cheerio.load(html);
  const products = [];

  const subscriptions = $("#subscriptions");

  for (const subscription of subscriptions) {
    const packages = $(subscription).find(".package");

    for (const _package of packages) {
      const $package = $(_package);
      
      const title = $package.find(".header h3").text();
      const name = $package.find(".package-name").text();
      const description = $package.find(".package-description").text();
      const price = $package.find(".package-price .price-big").text();

      products.push({
        title,
        name,
        description,
        price,
      });
    }
  }

  sortProducts(products);
  return products;
};

module.exports = {
  PRODUCT_URL,
  scrapeWL,
  sortProducts: _sortProducts,
};
