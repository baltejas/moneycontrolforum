const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(__dirname + '/public'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.engine('html', require('ejs').renderFile);

app.post('/', urlencodedParser, async function (req:any, res:any) {
  var query = req.body.query;
  var sectionId = "";
  var messages = "";
  
  const response1 = await fetch(`https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${query}&type=1&format=json`, 
    {headers: { "sec-ch-ua":"'Chromium';v='128', 'Not;A=Brand';v='24', 'Google Chrome';v='128'", "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "macOS", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate", "sec-fetch-site": "none", "sec-fetch-user": "?1", "upgrade-insecure-requests": "1", "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" }});
  const body1 = await response1.json();
  var stock = body1[0];
  var url = stock.forum_topics_url;
  var scId = stock.sc_id;
  var stockName = stock.name;
  var splits = url.split("/");
  var name = splits[splits.length - 1];
  var tokens = name.split("-");
  var id = tokens[tokens.length -1];
  sectionId = id.split(".")[0];

  try {
    const response2 = await fetch(`https://api.moneycontrol.com/mcapi/v2/mmb/get-messages/?section=topic&sectionId=${sectionId}&limitStart=0&limitCount=50&msgIdReference=`);
    const body2 = await response2.json();
    var comments = body2.data.list;
    comments.forEach(element => {
      var message = element.message;
      messages =  messages + "<p>" + message +  "</p><hr>";
    });
    const response3 = await fetch(`https://api.moneycontrol.com/mcapi/v1/stock/get-stock-price?scIdList=${scId}&scId=${scId}`);
    const body3 = await response3.json();
    var price = body3.data[0].lastPrice;
    var change:number = body3.data[0].perChange;
    var sign = (change > 0) ? "+" : "";
    var result = `<br><br><h3>Feed for ${stockName} with price ${price} (${sign}${change}%) </h3><hr>`;
    res.render(__dirname + "/views/home.html", {result: result, messages:messages});
  } catch(e) {
    var error = `We could not get stock feed, please try again.`;
    res.render(__dirname + "/views/home.html", {result: error, messages:""});
  }
});

app.get('/', function(req:any, res:any) {
  res.render(__dirname + "/views/home.html", {result: "", messages: "", priceChange: ""});

});

module.exports = app;