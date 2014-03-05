var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

var typeArr = [
	{name: 'ENERGY STAR CFL Bulbs  - 9-11 W', start: 9, stop:11},
	{name: 'ENERGY STAR CFL Bulbs  - 13-15 W', start: 13, stop: 15},
	{name: 'ENERGY STAR CFL Bulbs  - 18-20 W', start: 18, stop: 20},
	{name: 'ENERGY STAR CFL Bulbs  - 23-27 W', start: 23, stop: 27}
];

var currentWattageArr = [];
var page;
currentWattage = 0;
//var page = 'http://www.1000bulbs.com/search/?q='+currentWattage+'+watt+cfl&filter%5Battribute_energy_star%5D=Qualified&sort=price_a&page=2'
var baseURL = "http://www.1000bulbs.com";
var priceArr = [];
var bulbArr = [];

async.eachSeries(typeArr, function(typeItem, bigCallback){
	currentWattageArr = generateWattageArr(typeItem.start, typeItem.stop);
	console.log(currentWattageArr)
	async.eachSeries(currentWattageArr, function(currentWattage, callback) {
		console.log(currentWattage)
		page = 'http://www.1000bulbs.com/search/?q='+currentWattage+'+watt+cfl&filter%5Battribute_energy_star%5D=Qualified&sort=price_a&page=1'
	    scrapeCurrentWattage(currentWattage, callback);
	
	}, function(err) {

	  console.log('> done');
	  bigCallback();
	});
	
}, function(err){
	console.log('finished');
})


//var currentWattage = 13;
//var page = 'http://www.1000bulbs.com/search/?q=14+watt+cfl&filter[attribute_wattage]=10..19&filter[attribute_energy_star]=Qualified'
//var page = 'http://www.1000bulbs.com/search/?q='+currentWattage+'+watt+cfl&filter%5Battribute_wattage%5D=10..19&filter%5Battribute_energy_star%5D=Qualified&sort=price_a&page=1'

function scrapeCurrentWattage(currentWattage, callback) {
	console.log(page)
	request({
	  uri: page,
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);
	 	//console.log(body)
	  	var catListElements = $(".CatList").nextAll();
	  	count = catListElements.length
	  	priceArr = [];
		bulbArr = [];
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
			//console.log("price: " + price);
			// Now Let's grab the product title
			var title = $(this).find(".product-title-link")
			var titleStr = title.text();
			//console.log("title: " + titleStr)
			//console.log("currentWattage: " + currentWattage)
			// Only grab the low priced bulbs that have the specified wattage in the title (as a safety check)
			if(price <= 7 && (titleStr.search(currentWattage + " Watt") != -1)){

				// Now let's grab the link to the detail page
				var link = baseURL + title.attr('href');

				// Let's create our bulb object with the data we just scraped for later insertion into csv file
				var bulb = new Object();
				bulb.title = titleStr;
				bulb.price = price;
				bulb.link = link;

				bulbArr.push(bulb)

				priceArr.push(price)
			}

			count--;
		  	if(count === 3){

		  		var csvString = 'Name, Price, Source\n';
		  		//Lets generate the string needed to generate the csv file
		  		_.each(bulbArr, function(bulb){
		  			newRowStr = bulb.title + "," + bulb.price + "," + bulb.link + "\n";
		  			csvString = csvString + newRowStr;
		  		})

		  		console.log("currentWattage: " + currentWattage)
		  		console.log(priceArr)
		  		console.log("avg price: " + average(priceArr))
		  		//console.log(csvString)
		  		
		  		csv()
				.from(csvString)
				.to('./test'+currentWattage+'.csv')
				//.end(function(){callback();})
				callback();
			}
	  	});
	});

}


function average(priceArr){
	var sum = 0
	var count = priceArr.length

	_.each(priceArr, function(item){
		sum = sum + item;
	})

	if(count === 0) return 0;
	else {
		return (sum/count).toFixed(2);
	}
}

function generateWattageArr(start, stop) {
	var arr = [];
	for(i=start; i<=stop; i++){
		arr.push(i)
	}
	return arr;
}