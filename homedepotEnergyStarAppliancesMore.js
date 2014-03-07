var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");



var startTime = new Date();

var currentUrlArr = [];
var page;
currentUrl = 0;
var esCsvString = 'Category, Price, Wattage, Name, Source\n';
var baseCsvString = 'Category, Price, Wattage, Name, Source\n';

var baseURL = "http://www.homedepot.com";
var priceArr = [];
var bulbArr = [];

// First lets grab our list of energy star appliances we scraped so we can make sure none of them end up in this batch

// Clothes Washers
var esCW = "http://www.homedepot.com/b/Appliances-Washers-Dryers-Washers/ENERGY-STAR-Certified/N-5yc1vZ1z0tlzwZc3ov/Ntk-All/Ntt-clothes%2Bwasher?Ns=P_REP_PRC_MODE%7C0&NCNI-5"
var baseCW = "http://www.homedepot.com/b/Appliances-Washers-Dryers-Washers/N-5yc1vZc3ov/Ntk-All/Ntt-clothes%2Bwasher?Ntx=mode%2Bmatchall&NCNI-5&Ns=P_REP_PRC_MODE%7C0"

// Dishwashers
var esDW = "http://www.homedepot.com/b/Appliances-Dishwashers/ENERGY-STAR-Certified/N-5yc1vZc3poZ1z0tlzw/Ntk-All/Ntt-clothes%2Bwasher?Ntx=mode%20matchall&NCNI-5&Ns=P_REP_PRC_MODE%7C0"
var baseDW = "http://www.homedepot.com/b/Appliances-Dishwashers/N-5yc1vZc3po/Ntk-All/Ntt-clothes%2Bwasher?Ntx=mode%20matchall&NCNI-5&Ns=P_REP_PRC_MODE%7C0"

// Dehumidifiers
var esDH = "http://www.homedepot.com/b/Heating-Venting-Cooling-Air-Quality-Dehumidifiers/N-5yc1vZc4l8Z2bcq1eZ1z0tlzw?NCNI-5&Ns=P_REP_PRC_MODE%7C0"
var baseDH = "http://www.homedepot.com/b/Heating-Venting-Cooling-Air-Quality-Dehumidifiers/39-59/N-5yc1vZc4l8Z2bcq1e?NCNI-5&Ns=P_REP_PRC_MODE%7C0"

// Room Air Conditioners
var esRAC = "http://www.homedepot.com/b/Heating-Venting-Cooling-Air-Conditioners-Coolers-Air-Conditioners-Window-Air-Conditioners/ENERGY-STAR-Certified/N-5yc1vZc4luZ1z0tlzw?Ns=P_REP_PRC_MODE%7C0"
var baseRAC = "http://www.homedepot.com/b/Heating-Venting-Cooling-Air-Conditioners-Coolers-Air-Conditioners-Window-Air-Conditioners/N-5yc1vZc4lu?Ns=P_REP_PRC_MODE%7C0"


var efficientCSVString="";

var typeArr = [
	{name: 'ENERGY STAR Clothes Washers', es: esCW, base: baseCW},
	{name: 'ENERGY STAR Dishwashers', es: esDW, base: baseDW},
	{name: 'ENERGY STAR Dehumidifiers', es: esDH, base: baseDH},
	{name: 'ENERGY STAR Room Air Conditioners', es: esRAC, base: baseRAC},
];


var currentTypeItem;
getAll();

function getAll(){
	async.eachSeries(typeArr, function(typeItem, bigCallback){
		//currentUrlArr = generateWattageArr(typeItem.start, typeItem.stop);
		currentTypeItem = typeItem;
		urlArr = [typeItem.es, typeItem.base]
		async.eachSeries(urlArr, function(currentUrl, callback) {
			console.log("Scraping ES Appliances")

			//page = "http://www.homedepot.com/b/Heating-Venting-Cooling-Ventilation-Whole-House-Fans/N-25ecodZ25ecodZ5yc1vZc4kk/Ntk-Extended/Ntt-whole%2Bhouse%2Bfan?Ntx=mode+matchpartialmax&NCNI-5";

		    scrapecurrentUrl(currentUrl, typeItem.name, callback);
		
		}, function(err) {

		  bigCallback();
		});
		
	}, function(err){
		var filename = "ESAppliances.csv";
	  	csv()
		.from(esCsvString)
		.to('./' + filename)
		.on('end', function() {
	    	console.log('Wrote to ' + filename);
	    	console.log("Finished in " + (new Date().getTime()-startTime.getTime())/1000 + " sec")
	  	})
	  	csv()
		.from(baseCsvString)
		.to('./base' + filename)
		.on('end', function() {
	    	console.log('Wrote to base' + filename);
	    	console.log("Finished in " + (new Date().getTime()-startTime.getTime())/1000 + " sec")
	  	})
	})
}

function scrapecurrentUrl(currentUrl, currentCategory, callback) {
	request({
	  uri: currentUrl,
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);

	  	var productElements = $(".product.pod.plp-grid.grid_6").nextAll();
	  	count = productElements.length

	  	priceArr = [];
		bulbArr = [];
		var seen = {};
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
			// if(titleStr.search("-Pack") != -1){
			// 	var packNumIndex = titleStr.search("-Pack");

			// 	// The number in pack may be a two digit number so we need to check if that is the case
			// 	var bulbsInPack;
			// 	if(isNaN(titleStr.charAt(packNumIndex-2))) bulbsInPack = parseInt(titleStr.charAt(packNumIndex-1));
			// 	else {
			// 		bulbsInPack = parseInt(titleStr.substring(packNumIndex-2, packNumIndex));
			// 	}
			// 	var price = (price/bulbsInPack).toFixed(2);
			// }
			// Only grab the low priced bulbs that have the specified wattage in the title (as a safety check)
			if((titleStr.indexOf("DISCONTINUED") === -1)){

				// Now let's grab the link to the detail page
				var link = title.attr('href');

				// Let's create our bulb object with the data we just scraped for later insertion into csv file
				var bulb = new Object();
				bulb.category = currentCategory;
				bulb.price = price;
				bulb.wattage = currentUrl;
				bulb.title = titleStr;
				bulb.link = link;

				bulbArr.push(bulb)

				priceArr.push(price)

				delete newRowStr
				newRowStr = bulb.category + "," + bulb.price + ",NA," + bulb.title + "," + bulb.link + "\n";

				if(!seen[titleStr]) {
					seen[titleStr] = true;
					if(currentUrl === currentTypeItem.es) esCsvString = esCsvString + newRowStr;
					else if (currentUrl === currentTypeItem.base && esCsvString.indexOf(bulb.link) === -1) baseCsvString = baseCsvString + newRowStr;
					else console.log("error: no url match")
					//console.log(newRowStr)
				}
				//console.log(newRowStr);
				// Ensure we have not already appended this before
				//if(esCsvString.search(bulb.link) === -1 && esCsvString.search(bulb.title) === -1) esCsvString = esCsvString + newRowStr;
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