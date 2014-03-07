var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

var typeArr = [
	{name: 'Energy Star Bathroom Exhaust Fans', start: 1, stop: 1},
];

var startTime = new Date();

var currentWattageArr = [];
var page;
currentWattage = 0;
var csvString = 'Category, Price, Wattage, Name, Source\n';
var baseURL = "http://www.homedepot.com";
var priceArr = [];
var bulbArr = [];

// First lets grab our list of energy star appliances we scraped so we can make sure none of them end up in this batch
var fs = require('fs');
//var csv = require('csv');

// opts is optional
//var opts = ;

// csv()
// .from.path(__dirname+'/sample.in', { delimiter: ',', escape: '"' })
// .to.stream(fs.createWriteStream(__dirname+'/sample.out'))
// .transform( function(row){
//   row.unshift(row.pop());
//   return row;
// })
// .on('record', function(row,index){
//   console.log('#'+index+' '+JSON.stringify(row));
// })
// .on('close', function(count){
//   // when writing to a file, use the 'close' event
//   // the 'end' event may fire before the file has been written
//   console.log('Number of lines: '+count);
// })
// .on('error', function(error){
//   console.log(error.message);
// });
var efficientCSVString;

var efficientFilename = "homedepotBathroomExhuastFanseEnergyStar.csv";
csv()
	.from('./' + efficientFilename)
	.to.string(function(data){
		efficientCSVString = data;
		console.log(efficientCSVString)
	})
	.on('end', function() {
    	console.log('Loaded ' + efficientFilename);
    	getAll();
    	//console.log("Finished in " + (new Date().getTime()-startTime.getTime())/1000 + " sec")
  	})

function getAll(){
	async.eachSeries(typeArr, function(typeItem, bigCallback){
		currentWattageArr = generateWattageArr(typeItem.start, typeItem.stop);
		
		async.eachSeries(currentWattageArr, function(currentWattage, callback) {
			console.log("Scraping Bathroom Exhaust Fans")

			page = "http://www.homedepot.com/b/Fan-Only/N-5yc1vZ1z0yi0z/Ntk-All/Ntt-bathroom%2Bexhaust%2Bfan?Ntx=mode%20matchall&NCNI-5&Ns=P_REP_PRC_MODE%7C0";

		    scrapeCurrentWattage(currentWattage, typeItem.name, callback);
		
		}, function(err) {

		  bigCallback();
		});
		
	}, function(err){
		var filename = "homedepotBathroomExhuastFanseBaseline.csv";
	  	csv()
		.from(csvString)
		.to('./' + filename)
		.on('end', function() {
	    	console.log('Wrote to ' + filename);
	    	console.log("Finished in " + (new Date().getTime()-startTime.getTime())/1000 + " sec")
	  	})
	})
}

function scrapeCurrentWattage(currentWattage, currentCategory, callback) {
	request({
	  uri: page,
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
				bulb.wattage = currentWattage;
				bulb.title = titleStr;
				bulb.link = link;

				bulbArr.push(bulb)

				priceArr.push(price)

				delete newRowStr
				newRowStr = bulb.category + "," + bulb.price + "," + bulb.wattage + "," + bulb.title + "," + bulb.link + "\n";

				if(!seen[titleStr] && efficientCSVString.indexOf(bulb.link) === -1) {
					seen[titleStr] = true;
					csvString = csvString + newRowStr;
					//console.log(newRowStr)
				}
				//console.log(newRowStr);
				// Ensure we have not already appended this before
				//if(csvString.search(bulb.link) === -1 && csvString.search(bulb.title) === -1) csvString = csvString + newRowStr;
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