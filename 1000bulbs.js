var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

//var setPAurl = 'http://www.homedepot.com/webapp/wcs/stores/servlet/StoreFinderViewDetails?storeZip=15235&langId=-1&recordId=4116&latitude=40.4307&storeCity=Pittsburgh&longitude=-79.80557&storeState=PA&catalogId=10053&storeFinderCartFlow=false&storeId=10051&ddkey=http:THDStoreFinderStoreSet'
//var homedepotSearch = "http://www.homedepot.com/b/ENERGY-STAR-Certified/N-5yc1vZ1z0tlzw/Ntk-Extended/Ntt-9%2Bwatt%2Bcfl?rpp=96&Ns=P_REP_PRC_MODE%7C0&NCNI-5"

var typeArr = [
	{name: 'ENERGY STAR CFL Bulbs  - 9-11 W', start: 9, stop:11},
	{name: 'ENERGY STAR CFL Bulbs  - 13-15 W', start: 13, stop: 15},
	{name: 'ENERGY STAR CFL Bulbs  - 18-20 W', start: 18, stop: 20},
	{name: 'ENERGY STAR CFL Bulbs  - 23-27 W', start: 23, stop: 27}
];

var currentWattageArr = [];
var page;
currentWattage = 0;
var csvString = 'Category, Price, Wattage, Name, Source\n';
var baseURL = "http://www.1000bulbs.com";
var priceArr = [];
var bulbArr = [];

async.eachSeries(typeArr, function(typeItem, bigCallback){
	currentWattageArr = generateWattageArr(typeItem.start, typeItem.stop);

	async.eachSeries(currentWattageArr, function(currentWattage, callback) {
		console.log(currentWattage)
		page = 'http://www.1000bulbs.com/search/?q='+currentWattage+'+watt+cfl&filter%5Battribute_energy_star%5D=Qualified&sort=price_a&page=1'
	    scrapeCurrentWattage(currentWattage, typeItem.name, callback);
	
	}, function(err) {

	  console.log('> done');
	  bigCallback();
	});
	
}, function(err){
  	csv()
	.from(csvString)
	.to('./1000bulbs.csv')
	.on('end', function() {
    	console.log('finished');
  	})
})

function scrapeCurrentWattage(currentWattage, currentCategory, callback) {
	console.log(page)
	request({
	  uri: page,
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);

	  	var catListElements = $(".CatList").nextAll();
	  	count = catListElements.length
	  	priceArr = [];
		bulbArr = [];
	  	$(".CatList").each(function() {

	  		var elm = $(this);

	  		// Let's grab the price of this bulb
		  	var priceStr = elm.find(".PriceIs").first().text()
			var priceStrNoDollarSign = priceStr.replace("$", "");
			var price = parseFloat(priceStrNoDollarSign);

			// Now Let's grab the product title
			var title = $(this).find(".product-title-link")
			var titleStr = title.text();

			// Only grab the low priced bulbs that have the specified wattage in the title (as a safety check)
			if(price <= 7 && (titleStr.search(currentWattage + " Watt") != -1)){

				// Now let's grab the link to the detail page
				var link = baseURL + title.attr('href');

				// Let's create our bulb object with the data we just scraped for later insertion into csv file
				var bulb = new Object();
				bulb.category = currentCategory;
				bulb.price = price;
				bulb.wattage = currentWattage;
				bulb.title = titleStr;
				bulb.link = link;

				bulbArr.push(bulb)

				priceArr.push(price)
			}

			count--;
		  	if(count === 3){
		  		
		  		//Lets generate the string needed to generate the csv file
		  		_.each(bulbArr, function(bulb){
		  			newRowStr = bulb.category + "," + bulb.price + "," + bulb.wattage + "," + bulb.title + "," + bulb.link + "\n";
		  			csvString = csvString + newRowStr;
		  		})

		  		console.log("currentWattage: " + currentWattage)
		  		console.log(priceArr)
		  		console.log("avg price: " + average(priceArr))
		  		
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