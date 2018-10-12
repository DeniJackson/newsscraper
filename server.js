const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var axios = require('axios');
var PORT = process.env.PORT || 3000;



var db = require("./models");






var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


mongoose.connect("mongodb://localhost/webscraper");



app.get('/scraper', function (req, res) {
    axios.get("https://news.ycombinator.com/").then(function (response) {

        var $ = cheerio.load(response.data);

        $(".title a.storylink").each(function (i, element) {
            var data = {}
                    data.title = $(element).text();
                     data.link = $(element).attr("href");

                     db.Article.create(data).then(function(dbArticle){
                         console.log(dbArticle);
                     }).catch(function(err){
                         return res.json(err);
                     })

                });
                res.send("Successful scrape");

    });

});

app.get("/", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.render('home', {articles:dbArticle})})
      .catch(function(err) {
        res.json(err);
      });
  });

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("Comment")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
      .then(function(dbComment) {
        
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { Comment: dbComment._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  

app.listen(PORT);