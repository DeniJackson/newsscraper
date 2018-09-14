const express = require('express');
const exphbs = require('express-handlebars');
// const mongoose = require('mongoose');
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");



// var db = require("./models");






var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// mongoose.connect("mongodb://localhost/webscraper");



app.get('/', function (req, res) {
    var data = {
        results: []
    };

    request("https://news.ycombinator.com/", function (error, response, html) {
        var $ = cheerio.load(html);



        $(".title a.storylink").each(function (i, element) {

            var title = $(element).text();
            var link = $(element).attr("href");

            data.results.push({
                title: title,
                link: link
            });
        });
        console.log(data);

        res.render('home', data);


    });
});



app.listen(3000);