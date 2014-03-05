var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");

var page = 'http://www.1000bulbs.com/search/?q=13+watt+cfl&filter[attribute_wattage]=10..19&filter[attribute_energy_star]=Qualified'
var baseURL = "http://www.1000bulbs.com";
var priceArr = [];
var bulbArr = [];

request({
  uri: page,
}, function(error, response, body) {
  	var $ = cheerio.load(body);
 	//console.log(body)
  	var catListElements = $(".CatList").nextAll();
  	count = catListElements.length
  	$(".CatList").each(function() {
	  	var elm = $(this);
	  	var name = $(this).find(".first_list li")

	  	// name.each(function(){
	  	// 	lielm = $(this)
	  	// 	if (lielm.text().search('13 Watt') != -1) {
			 //  	//console.log("found one!")
			 //  	//console.log($(this).text())
		  // 		var priceStr = elm.find(".PriceIs").first().text()
		  // 		var priceStrNoDollarSign = priceStr.replace("$", "");
		  // 		var price = parseFloat(priceStrNoDollarSign);
		  // 		//console.log(price)
		  // 		priceArr.push(price)
		  		
	  	// 	}
	  	// })

  		// Let's grab the price of this bulb
	  	var priceStr = elm.find(".PriceIs").first().text()
		var priceStrNoDollarSign = priceStr.replace("$", "");
		var price = parseFloat(priceStrNoDollarSign);

		// Now let's grab the product title and the link to the detail page
		var title = $(this).find(".product-title-link")
		var titleStr = title.text();
		var link = baseURL + title.attr('href');

		var bulb = new Object();
		bulb.title = titleStr;
		bulb.price = price;
		bulb.link = link;

		bulbArr.push(bulb)
		// console.log(bulb.title)
		// console.log(bulb.price)
		// console.log(bulb.link)
		// console.log(" ")

		//console.log(price)
		priceArr.push(price)
	  	//console.log(count)
	  	count--;
	  	if(count === 3){
	  		console.log(bulbArr)
	  		console.log("average: " + average(priceArr))
	  		csv()
			.from('"1","2","3","4","5"\n"3"')
			.to('./file.csv')
		}
  	});
});

function average(priceArr){
	var sum = 0
	var count = priceArr.length

	_.each(priceArr, function(item){
		sum = sum + item;
	})

	if(sum === 0) return 0;
	else {
		return (sum/count).toFixed(2);
	}
}