var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

var typeArr = [
	{name: 'ENERGY STAR CFL Bulbs  - 9-11 W', start: 29, stop: 29},
	{name: 'ENERGY STAR CFL Bulbs  - 13-15 W', start: 43, stop: 43},
	{name: 'ENERGY STAR CFL Bulbs  - 18-20 W', start: 53, stop: 53},
	{name: 'ENERGY STAR CFL Bulbs  - 23-27 W', start: 72, stop: 72}
];

var startTime = new Date();

var currentWattageArr = [];
var page;
currentWattage = 0;
var csvString = 'Category, Price, Wattage, Name, Source\n';
var baseURL = "http://www.homedepot.com";
var priceArr = [];
var bulbArr = [];

async.eachSeries(typeArr, function(typeItem, bigCallback){
	currentWattageArr = generateWattageArr(typeItem.start, typeItem.stop);

	async.eachSeries(currentWattageArr, function(currentWattage, callback) {
		console.log("Scraping " + currentWattage + " Watt Halogens")

		//page = "http://www.homedepot.com/b/Electrical-Light-Bulbs-CFL-Light-Bulbs/ENERGY-STAR-Certified/N-5yc1vZ1z0tlzwZbmat/Ntk-Extended/Ntt-" + currentWattage + "%2Bwatt%2Bcfl?Ns=P_REP_PRC_MODE%7C0&NCNI-5";
		page = "http://www.homedepot.com/s/" + currentWattage + "-watt%2520halogen?NCNI-5";

	    scrapeCurrentWattage(currentWattage, typeItem.name, callback);
	
	}, function(err) {

	  bigCallback();
	});
	
}, function(err){
	var filename = "homedepotBaseline.csv";
  	csv()
	.from(csvString)
	.to('./' + filename)
	.on('end', function() {
    	console.log('Wrote to ' + filename);
    	console.log("Finished in " + (new Date().getTime()-startTime.getTime())/1000 + " sec")
  	})
})

function scrapeCurrentWattage(currentWattage, currentCategory, callback) {
	request({
	  uri: page,
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);

	  	var productElements = $(".product.pod.plp-grid.grid_6").nextAll();
	  	count = productElements.length

	  	priceArr = [];
		bulbArr = [];
	  	$(".product").each(function() {

	  		var elm = $(this);

	  		// Let's grab the price of this bulb
		  	var priceStr = elm.find(".item_price").first().text()

			var priceStrNoDollarSign = priceStr.replace("$", "");
			var price = parseFloat(priceStrNoDollarSign);

			// Now Let's grab the product title
			var title = $(this).find(".item_description")
			//Grab text and remove the unecessary 26 initial characters home depot appends to the beginning
			var titleStr = title.text().substring(26, title.text().length);

			// Replace the &nbsp to a normal space -> &nbsp gets converted to weird character in CSV file
			titleStr = titleStr.replace('\xa0', " ");

			// Also replace any commas in title since we are loading into a comma separated values file
			titleStr = titleStr.replace(",", "");

			// We want the price per bulb, so if the price is per pack is given, we need to calculate the price per each bulb in the pack
			if(titleStr.search("-Pack") != -1){
				var packNumIndex = titleStr.search("-Pack");

				// The number in pack may be a two digit number so we need to check if that is the case
				var bulbsInPack;
				if(isNaN(titleStr.charAt(packNumIndex-2))) bulbsInPack = parseInt(titleStr.charAt(packNumIndex-1));
				else {
					bulbsInPack = parseInt(titleStr.substring(packNumIndex-2, packNumIndex));
				}
				var price = (price/bulbsInPack).toFixed(2);
			}
			// Only grab the low priced bulbs that have the specified wattage in the title (as a safety check)
			if(price <= 999999 && (titleStr.search("DISCONTINUED") === -1)){

				// Now let's grab the link to the detail page
				var link = title.attr('href');

				// Let's create our bulb object with the data we just scraped for later insertion into csv file
				var bulb = new Object();
				bulb.category = currentCategory;
				bulb.price = price;
				bulb.wattage = currentWattage;
				bulb.title = titleStr;
				bulb.link = link;

				bulbArr.push(bulb)

				priceArr.push(price)

				newRowStr = bulb.category + "," + bulb.price + "," + bulb.wattage + "," + bulb.title + "," + bulb.link + "\n";

				// Ensure we have not already appended this before
				if(csvString.search(bulb.link) === -1) csvString = csvString + newRowStr;
			}

			count--;
	  	});
		callback();
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