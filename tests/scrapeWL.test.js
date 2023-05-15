require('dotenv').config();
const { sortProducts } = require("../scrapeWL");
const fetch = require("node-fetch");
const { scrapeWL, PRODUCT_URL } = require("../scrapeWL");
const cheerio = require("cheerio");

jest.mock("node-fetch");

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
})

describe("sortProducts", () => {
  it("should sort the products in descending order by price", () => {
    const mockProducts = [
      {
        price: "£100",
      },
      {
        price: "£120",
      },
      {
        price: "£50",
      },
      {
        price: "200",
      },
    ];
    const res = sortProducts(mockProducts);
    expect(res).toEqual([
      {
        price: "200",
      },
      {
        price: "£120",
      },
      {
        price: "£100",
      },
      {
        price: "£50",
      },
    ]);
  });
});

describe("scrapeWL", () => {
  beforeEach(() => {
    fetch.mockResolvedValue({
      status: 200,
      text: jest.fn(),
    });
    
  });
  it("should throw an error if fetch failed", async () => {
    fetch.mockResolvedValue({
      status: 500
    });
    expect(scrapeWL()).rejects.toThrow("Error fetching webpage");
  })
  it("should fetch the html of the corresponding URL and parse it", async () => {
    const mockCheerio = jest.fn(() => ({
      find: jest.fn(),
      text: jest.fn(),
      [Symbol.iterator]: function* () {},
    }));

    jest.spyOn(cheerio, "load").mockReturnValue(mockCheerio);

    await scrapeWL();

    expect(fetch).toHaveBeenCalledWith(PRODUCT_URL);
    expect(cheerio.load).toHaveBeenCalled();
  });

  it("should get products information from the html", async () => {
    const mockHtml = `
    <html>
      <body>
      <div id="subscriptions">
    <!-- PACKAGE TWO -->
      <div class="col-xs-4">
          <div class="package featured center" style="margin-left:0px;">
              <div class="header dark-bg">
                  <h3>Standard</h3>
              </div>
              <div class="package-features">
                  <ul>
                      <li>
                          <div class="package-name">MockPackageName-A</div>
                      </li>
                      <li>
                          <div class="package-description">MockPackageDesc-A</div>
                      </li>
                      <li>
                          <div class="package-price"><span class="price-big">£9.99</span><br>(inc. VAT)<br>Per Month</div>
                      </li>
                      <li>
                          <div class="package-data">12 Months - Data &amp; SMS Service Only</div>
                      </li>
                  </ul>
                  <div class="bottom-row">
                      <a class="btn btn-primary main-action-button" href="https://wltest.dns-systems.net/" role="button">Choose</a>
                  </div>
              </div>
          </div>
      </div> <!-- /END PACKAGE -->

      <!-- PACKAGE THREE -->
        <div class="col-cs-4">
          <div class="package featured-right" style="margin-top:0px; margin-left:0px; margin-bottom:0px">
              <div class="header dark-bg">
                  <h3>Optimum</h3>
              </div>
              <div class="package-features">
                  <ul>
                      <li>
                          <div class="package-name">MockPackageName-B</div>
                      </li>
                      <li>
                          <div class="package-description">MockPackageDesc-B</div>
                      </li>
                      <li>
                          <div class="package-price"><span class="price-big">£15.99</span><br>(inc. VAT)<br>Per Month</div>
                      </li>
                      <li>
                          <div class="package-data">12 Months - Data &amp; SMS Service Only</div>
                      </li>
                  </ul>
                  <div class="bottom-row">
                      <a class="btn btn-primary main-action-button" href="https://wltest.dns-systems.net/#" role="button">Choose</a>
                  </div>
              </div>
          </div>
      </div> <!-- /END PACKAGE -->
      </div>
      </body>
    </html>
    `;
    fetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue(mockHtml)
    });
    const products = await scrapeWL();
    expect(products).toEqual([
      {
        title: "Optimum",
        name: "MockPackageName-B",
        description: "MockPackageDesc-B",
        price: "£15.99",
      },
      {
        title: "Standard",
        name: "MockPackageName-A",
        description: "MockPackageDesc-A",
        price: "£9.99",
      },
    ]);
  });
});
