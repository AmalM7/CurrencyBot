"use strict";
const Restify = require("restify");
const server = Restify.createServer({
  name: "CurrencyBot"
});
const request = require("request");
const PORT = process.env.PORT || 3000;

server.use(Restify.plugins.bodyParser());
server.use(Restify.plugins.jsonp());

const convertCurrency = (amountToConvert, outputCurrency, cb) => {
  const { amount, currency } = amountToConvert;
  return request(
    {
      url: "https://free.currconv.com/api/v7/convert",
      qs: {
        q: `${currency}_${outputCurrency}`,
        compact: "y",
        apiKey: "e3437194f0d00685e875"
      },
      method: "GET",
      json: true
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        let computedValue = Math.round(
          body[`${currency}_${outputCurrency}`]["val"] * amount
        );
        cb(
          null,
          `${amount} ${currency} converts to about ${outputCurrency} ${computedValue} as per current rates!`
        );
      } else {
        cb(error, null);
      }
    }
  );
};

// POST route handler
server.post("/", (req, res, next) => {
  let { queryResult } = req.body;

  if (queryResult) {
    const { outputCurrency, amountToConvert } = queryResult.parameters;

    // Check if input currency code === output currency code
    if (amountToConvert.currency === outputCurrency) {
      const { amount } = amountToConvert;

      let responseText = `Well, ${amount} ${outputCurrency} is obviously equal to ${amount} ${outputCurrency}!`;
      let respObj = {
        fulfillmentText: responseText
      };
      res.json(respObj);
    } else {
      // Query the fixer.io API to fetch rates and create a response

      convertCurrency(amountToConvert, outputCurrency, (error, result) => {
        if (!error && result) {
          let respObj = {
            fulfillmentText: result
          };
          res.json(respObj);
        }
      });
    }
  }

  return next();
});

server.listen(PORT, () => console.log(`CurrencyBot running on ${PORT}`));
