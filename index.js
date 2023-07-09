const fs = require('fs');
const http = require('http');
const url = require('url');

// map and replace the elements in the templates
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  return output;
};

// read the templates and keep in memory at the beginning as they won´t change
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

// read the JSON file and parse data into an object
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const server = http.createServer((req, res) => {
  const pathname = req.url;

  // extract query number from search parameters in the URL
  const searchParams = new URLSearchParams(
    pathname.substring(pathname.indexOf('?'))
  );
  const query = searchParams.get('id');

  if (pathname === '/' || pathname === '/overview') {
    // generic route for overview of all products
    res.writeHead(200, { 'Content-type': 'text/html' });

    // let´s parse into an array of object the dataObject object and join final array into a string
    const cardsHtml = dataObject
      .map((el) => replaceTemplate(templateCard, el))
      .join('');

    // replace every product_card placeholder by the cardsHtml content piece
    const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  } else if (pathname === `/product?id=${query}`) {
    // route for product details by using thw query id as reference
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObject[query];
    const output = replaceTemplate(templateProduct, product);
    res.end(output);
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  } else {
    // you can define headers, always before setting the res.end()
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hellow-world',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Server listening on port 8000...');
});
