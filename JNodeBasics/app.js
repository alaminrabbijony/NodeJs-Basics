const fs = require("fs");

/*
 * File System
 */
// const bodyParse = require('body-parser')

// const textIn = fs.readFileSync('./txt/input.txt', "utf-8")

// console.log(textIn)

// const textOut = `The details about cows: ${textIn}. \nCreate At: ${Date.now()}`
// fs.writeFileSync("./txt/input.txt", textOut)
// console.log(textOut)

// fs.readFile("./txt/starter.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR");
//   console.log(data1);
//   fs.readFile(`./txt/read-this.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/appendix.txt", "utf-8", (err, data3) => {
//       console.log(data3);
//     });
//   });
// });

// console.log(" I am more faster");

/*
 * Server
 */

const http = require("http");
const url = require("url");

const replaceTemp = (temp, el) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, el.productName);
  output = output.replace(/{%IMAGE%}/g, el.image);
  output = output.replace(/{%FROM%}/g, el.from);
  output = output.replace(/{%NUTRIENTS%}/g, el.nutrients);
  output = output.replace(/{%QUANTITY%}/g, el.quantity);
  output = output.replace(/{%PRICE%}/g, el.price);
  output = output.replace(/{%DESCRIPTION%}/g, el.description);
  output = output.replace(/{%ID%}/g, el.id);

  return output;
};

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);
//console.log(data)

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // const pathname = req.url;
  // console.log(pathname )
  // console.log(url.parse(pathname))
  /* OVERVIEW */
  if (pathname === "/" || pathname === "/overview") {
    const cardHtml = dataObj.map((el) => replaceTemp(tempCard, el)).join("");
    const output = tempOverview.replace(`{%PRODUCT_CARDS%}`, cardHtml);
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end(output);
  } else if (pathname === "/product") {
  /* PRODUCT */
    const product = dataObj[query.id];
    const output = replaceTemp(tempProduct, product);

    res.end(output);
  } else if (pathname === "/api") {
  /* API */
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-header": "hello world",
    });
    res.end("<h1>404 <br> page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening from port 8000");
});
