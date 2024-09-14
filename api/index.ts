const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config();
const app = express();
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

app.post('/', urlencodedParser, async function (req:any, res:any) {
  try {
    var isSentiment = req.body.isSentiment;
    var query = req.body.query;
    var sectionId = "";
    var messages = "<h3>Forum Comments</h3>";
    const headers = { "sec-ch-ua":"'Chromium';v='128', 'Not;A=Brand';v='24', 'Google Chrome';v='128'", "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "macOS", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate", "sec-fetch-site": "none", "sec-fetch-user": "?1", "upgrade-insecure-requests": "1", "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" };
    const response1 = await fetch(`https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${query}&type=1&format=json`, {headers: headers});
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
    const response2 = await fetch(`https://api.moneycontrol.com/mcapi/v2/mmb/get-messages/?section=topic&sectionId=${sectionId}&limitStart=0&limitCount=100&msgIdReference=`);
    const body2 = await response2.json();
    var comments = body2.data.list;
    comments.forEach(element => {
      var message = element.message;
      var createdDate = element.ent_date.split(" ")[0];
      messages =  messages + `<small>${createdDate}</small><p>` + message +  "</p><hr>";
    });
    const response3 = await fetch(`https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${scId}`);
    const body3 = await response3.json();
    var price = body3.data.pricecurrent;
    var change = body3.data.pricechange;
    var pe = body3.data.PECONS;
    var pb = body3.data.PBCONS;
    var sector = body3.data.SC_SUBSEC;
    var sectorpe = body3.data.IND_PE;
    var sign = (change > 0) ? "+" : "";
    var priceChange = `(${sign}${change})`;
    res.render(__dirname + "/views/home.html", {stockName: `<h3>${stockName}</h3>`, sector: `Sector ${sector}`, price: `Price ${price}`, change: priceChange, pe:`PE ${pe}`, pb:`PB ${pb}`, sectorpe: `Sector PE ${sectorpe} <hr>`, messages:messages});
  } catch(e) {
    console.log(e);
    var error = `We could not get the stock feed, please try again.`;
    res.render(__dirname + "/views/home.html", {stockName: "", sector: "", price: "", change: "", pe:"", pb:"", sectorpe: "", messages:error});
  }
});

app.get('/', function(req:any, res:any) {
  res.render(__dirname + "/views/home.html", {stockName: "", price: "", sector: "", change: "", pe:"", pb:"", sectorpe: "", messages:""});

});

module.exports = app;