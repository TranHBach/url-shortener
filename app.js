const path = require("path");
const express = require("express");
const fs = require("fs");
const { check, validationResult } = require("express-validator");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

app.use("/api/shorturl/:id", (req, res, next) => {
  let url;
  fs.readFile("url.txt", "utf-8", (err, data) => {
    const dataArray = data.split("\n");
    url = JSON.parse(dataArray[+req.params.id - 1]).original_url;
    return res.redirect(url);
  });
});

app.use(
  "/api/shorturl",
  check("url", "Not a valid url").isURL(),
  (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return next(err.errors[0]);
    }
    let returnObj;
    fs.readFile("url.txt", "utf-8", (err, data) => {
      const dataArray = data.split("\n");
      let shortUrlId;
      if (dataArray.length !== 1) {
        lastItem = JSON.parse(dataArray.at(-2));
        shortUrlId = lastItem.short_url + 1;
      } else {
        shortUrlId = 1;
      }
      returnObj = {
        original_url: req.body.url,
        short_url: shortUrlId,
      };
      data = data + JSON.stringify(returnObj) + "\n";
      fs.writeFile("url.txt", data, "utf-8", () => {
        return res.json(returnObj);
      });
    });
  }
);

app.use("/", (req, res, next) => {
  return res.render("index");
});

app.use((err, req, res, next) => {
  return res.json({ error: "Invalid URL" });
});

app.listen(3001);
