var express = require('express');

var app = express();
app.get('/comments', async function (req, res) {
  var ticker = req.query.stock;
  var sectionId = "";
  var messages:any = [];

  const response1 = await fetch(`https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${ticker}&type=1&format=json`);
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
    messages.push(message);
  });
  res.send(messages);
});

app.listen(3000, function () {
  console.log('Server ready on port 3000.');
});

app.get("/", (req, res) => res.send("Express on Vercel"));