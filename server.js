const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var axios = require('axios');



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
    // var data = {
    //     results: []
    // };

    // request("https://news.ycombinator.com/", function (error, response, html) {
    //     var $ = cheerio.load(html);

    //     $(".title a.storylink").each(function (i, element) {

    //         var title = $(element).text();
    //         var link = $(element).attr("href");

    //         data.results.push({
    //             title: title,
    //             link: link
    //         });
    //     });
    //     console.log(data);

    //     res.render('home', data);    
    // });
});

// Route for getting all Articles from the db
app.get("/", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.render('home', {articles:dbArticle})})
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("Comment")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { Comment: dbComment._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  

app.listen(3000);