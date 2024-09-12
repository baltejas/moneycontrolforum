const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use(express.static(__dirname + '/public'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.engine('html', require('ejs').renderFile);

app.post('/comments', urlencodedParser, async function (req:any, res:any) {
  var query = req.body.query;
  var sectionId = "";
  var messages = "";

  const response1 = await fetch(`https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${query}&type=1&format=json`);
  const body1 = await response1.json();
  var stock = body1[0];
  var url = stock.forum_topics_url;
  var splits = url.split("/");
  var name = splits[splits.length - 1];
  var tokens = name.split("-");
  var id = tokens[tokens.length -1];
  sectionId = id.split(".")[0];

  const response2 = await fetch(`https://api.moneycontrol.com/mcapi/v2/mmb/get-messages/?section=topic&sectionId=${sectionId}&limitStart=0&limitCount=50&msgIdReference=`);
  const body2 = await response2.json();
  var comments = body2.data.list;
  comments.forEach(element => {
    var message = element.message;
    messages =  messages + "<p>" + message +  "</p><hr>";
  });
  res.render(__dirname + "/views/home.html", {messages:messages});
});

app.get('/', function(req:any, res:any) {
  res.render(__dirname + "/views/home.html", {messages:""});

});

module.exports = app;