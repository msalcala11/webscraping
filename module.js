var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");
var fs = require("fs");

//An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
var urls = [
			
			{
				measure: "ENERGY STAR Television",
				//baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=",

						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=1
						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=2
						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=100&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=3	
				//esUrl: "does not matter"//"http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DTV+Type~Plasma+Flat-Panel%5Etvfeatures_facet%3DSAAS~TV+Features~ENERGY+STAR+Certified&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001"
			},
			{
				measure: "ENERGY STAR Computer",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=pcmcat138500050001_categoryid%24abcat0502000&sc=Global&nrp=50&sp=-bestsellingsort+skuidsaas&qp=SAAS~&usc=All+Categories&fs=saas&browsedCategory=pcmcat138500050001&seeAll=&gf=y&cp=",
				//esUrl: "does not matter"
			},

			{
				measure: "ENERGY STAR Monitor",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=pcmcat143700050048_categoryid%24abcat0509000&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=aspectratio_facet%3DAspect+Ratio~16%3A9%5Easpectratio_facet%3DAspect+Ratio~16%3A10%5Easpectratio_facet%3DAspect+Ratio~5%3A4%5Easpectratio_facet%3DAspect+Ratio~4%3A3%5Easpectratio_facet%3DAspect+Ratio~21%3A9%5Easpectratio_facet%3DAspect+Ratio~4%3A3+and+16%3A9%5Econdition_facet%3DSAAS~Condition~New&usc=All+Categories&fs=saas&browsedCategory=pcmcat143700050048&seeAll=%2CMaximum_Resolution&gf=y&cp=",
				//esUrl: "does not matter"
			},

			{
				measure: "ENERGY STAR Printer (InkJet)",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0511002&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=condition_facet%3DCondition~New%5Ecurrentprice_facet%3DPrice~%2450+-+%2499.99%5Ecurrentprice_facet%3DPrice~%24100+-+%24149.99%5Ecurrentprice_facet%3DPrice~%24150+-+%24199.99%5Ecurrentprice_facet%3DPrice~%24200+-+%24249.99%5Ecurrentprice_facet%3DPrice~%24250+-+%24499.99%5Ecurrentprice_facet%3DPrice~%24500+-+%24749.99%5Ecurrentprice_facet%3DPrice~%24750+-+%24999.99%5Ecurrentprice_facet%3DPrice~%241000+-+%241249.99%5Ecurrentprice_facet%3DPrice~%241250+-+%241499.99%5Ecurrentprice_facet%3DPrice~%241500+-+%241999.99%5Ecurrentprice_facet%3DPrice~%242000+-+%242499.99%5Ecurrentprice_facet%3DPrice~%242500+-+%242999.99%5Ecurrentprice_facet%3DSAAS~Price~%243000+and+Up&usc=All+Categories&fs=saas&browsedCategory=abcat0511002&seeAll=%2CBrand&gf=y&cp=",
				//esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Printer (LaserJet)",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0511003&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=currentprice_facet%3DPrice~%2450+-+%2499.99%5Ecurrentprice_facet%3DPrice~%24100+-+%24149.99%5Ecurrentprice_facet%3DPrice~%24150+-+%24199.99%5Ecurrentprice_facet%3DPrice~%24200+-+%24249.99%5Ecurrentprice_facet%3DPrice~%24250+-+%24499.99%5Ecurrentprice_facet%3DPrice~%24500+-+%24749.99%5Ecurrentprice_facet%3DPrice~%24750+-+%24999.99%5Ecurrentprice_facet%3DPrice~%241000+-+%241249.99%5Ecurrentprice_facet%3DPrice~%241250+-+%241499.99%5Ecurrentprice_facet%3DPrice~%241500+-+%241999.99%5Ecurrentprice_facet%3DPrice~%242000+-+%242499.99%5Ecurrentprice_facet%3DPrice~%242500+-+%242999.99%5Ecurrentprice_facet%3DPrice~%243000+and+Up%5Econdition_facet%3DSAAS~Condition~New&usc=All+Categories&fs=saas&browsedCategory=abcat0511003&seeAll=&gf=y&cp=",
				//esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Printer (All-In-One - InkJet)",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0511004&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=condition_facet%3DSAAS~Condition~New&usc=All+Categories&fs=saas&browsedCategory=abcat0511004&seeAll=&gf=y&cp=",
				//esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Printer (All-In-One - LaserJet)",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0511005&sc=Global&nrp=15&sp=%2Bcurrentprice+skuidsaas&qp=condition_facet%3DSAAS~Condition~New&usc=All+Categories&fs=saas&browsedCategory=abcat0511005&seeAll=&gf=y&cp=",
				//esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Fax Machine/Copier",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=-2989966466046614248&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0511011&sc=Global&cp=1&sp=-bestsellingsort+skuidsaas&qp=brand_facet%3DBrand~Panasonic%5Ebrand_facet%3DBrand~Brother%5Ecurrentprice_facet%3DPrice~%2450+-+%2499.99%5Ecurrentprice_facet%3DPrice~%24100+-+%24149.99%5Ecurrentprice_facet%3DSAAS~Price~%24250+-+%24499.99&list=y&usc=All+Categories&nrp=15&fs=saas&iht=n&cp=11",
				//esUrl: "does not matter"
			},
			]

//An object of jquery selectors we will be using to find dom elements
var selectors = {
	product: ".hproduct", //assumes you are running a find on the body element
	title: ".info-main h3 a", //assumes that you are running a find() on a single product element
	price: ".info-side div h4 span",
	link: ".info-main h3 a",
	sku: ".sku",
	energyStar: ".info-main div.description font" // not always accurate so we don't use this anymore (we actually have to make a call to the detail page)
}

module.exports = {
	urls: defineUrls(), //An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
	defineUrls: defineUrls,
	selectors: defineSelectors(), //An object of jquery selectors we will be using to find dom elements
	defineSelectors: defineSelectors,
	grabPage: grabPage,
	getProducts: getProducts,
	getProductTitle: getProductTitle,
	getProductPrice: getProductPrice,
	getProductLink: getProductLink,
	getProductSku: getProductSku,
	isEnergyStar: isEnergyStar,
	generateNewCsvString: generateNewCsvString,
	addCsvRow: addCsvRow,
	writeCsvFile: writeCsvFile,
	buildCsvString: buildCsvString,
	scrapeData: scrapeData,
	iterateThroughSearchResults: iterateThroughSearchResults
}

function defineSelectors() { 
	return selectors;
}

function defineUrls(){
	return urls;
}

function grabPage(url, cb){

	request({
	  uri: url,
	  headers: {
        	'User-Agent': 'Mozilla/5.0' // Imitate a browser so our request does not get blocked
    	}
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);

	  	console.log("grabbed page")
	  	// Let's return the jquery element of the body html
	  	cb($);
	 })
}

function getProducts($){
	console.log("getting product")
	var productsElm = $(selectors.product)
	return productsElm;
}

function getProductTitle(bodyElm, productElm){
	var productTitleStr = bodyElm(productElm).find(selectors.title).text()
	var noComma = productTitleStr.replace(new RegExp(",", "g"), " ");
	var noNewLine = noComma.replace(new RegExp("\n", "g"), "")
	return noNewLine;
}

function getProductPrice(bodyElm, productElm){
	var productPriceStr = bodyElm(productElm).find(selectors.price).text()
	var noDollarSign = productPriceStr.replace("$", "");
	var noComma = noDollarSign.replace(new RegExp(",", "g"), "");
	var noNewLine = noComma.replace(new RegExp("\n", "g"), "")
	// Let's remove the dollar sign before insertion into the csv file

	// If a no price element was found matching the price selector passed in above,
	// then an empty string is returned
	return noNewLine;
}

function getProductLink(bodyElm, productElm){

	var productLinkStr = bodyElm(productElm).find(selectors.link).attr('href')
	return "http://www.bestbuy.com" + productLinkStr;
}

function getProductSku(bodyElm, productElm){
	
	var productSkuStr = bodyElm(productElm).find(selectors.sku).text()
	return productSkuStr;
}

function isEnergyStar(sku, cb) {

// template url format: (all we need is the sku) http://www.bestbuy.com/site/hanns-g-15-6-lcd-monitor/2957194.p;template=_specificationsTab
	var templateUrl = "http://www.bestbuy.com/site/anythinggoeshere/" + sku + ".p;template=_specificationsTab";
	grabPage(templateUrl, function($){

		var energyStarTableRowText = $("tr:contains('ENERGY STAR Certified')").text()

		if(energyStarTableRowText.indexOf("Yes") != -1) cb(true)
		else if(energyStarTableRowText.indexOf("Unknown") != -1) cb("unknown")
		else cb(false);
	})
}

function generateNewCsvString() {
	// defines the header row of a new csv string
	var headerStr = 'Category, Price, Energy Star, Name, Source\n';
	return headerStr;
}

function addCsvRow(csvString, category, price, energyStar, name, source) {
	// adds a new csv row to an existing csvString
	if(price === "") return csvString;
	else {
		var updatedCsvString = csvString + category + "," + price + "," + energyStar + "," + name.trim() + "," + source + "\n";
		return updatedCsvString;		
	}
}

function writeCsvFile(csvString, filename, cb){
	fs.writeFile(filename, csvString, function(err){
		if(err) throw err;
		cb()
	})
}

function iterateThroughSearchResults(measureName, searchURL, csvString, cb){

	// We want to loop through all the search result page numbers and continue to pull data into the master csv string while there is 
	// data on the page. At the end we want to provide a callback with the updated master csv string
	//var count = 0;
	var pageNum = 1;
	var noMoreResults = false;

	async.whilst(
	    function () { return noMoreResults === false; },
	    function (whilstCallback) {

	    	// append the page number to the search url and get the jquery body
	        grabPage(searchURL + pageNum, function gotPage(baseBody){

				var productsElm = getProducts(baseBody);
				console.log("measure: " + measureName)
				console.log("pageNum: " + pageNum)

				console.log("Num of products on page: " + productsElm.length)

				// If no results showed up on this page (or if we are on fax machines and we have already gotten them) then we need to exit the loop
				if(productsElm.length === 0 || (measureName === "ENERGY STAR Fax Machine/Copier" && pageNum === 2) ) {
					noMoreResults = true;
					return whilstCallback();
				}

	        	// Iterate through each product shown on the page
	        	async.eachSeries(productsElm, function(productElm, callback){
	        			
	        			// Make a call to the product detail page to determine whether it is energy star or not
		        		isEnergyStar(getProductSku(baseBody, productElm), function(energyStarBool){
		        				// If the energy star status is labeled as unknown do not include record in csv file
								if(energyStarBool === "unknown") return callback();
								csvString = addCsvRow(csvString, 
										measureName,
										getProductPrice(baseBody, productElm), 
										energyStarBool, 
										getProductTitle(baseBody, productElm), 
										getProductLink(baseBody, productElm)     
									);
								callback();
		        		})


	        		 },function(err){

	        		 	pageNum++;
						return whilstCallback()
	        	})

			})

	    },
	    function (err) {
	    	// Return our updated string via our callback function
	    	cb(csvString);
	    }
	);
}

function buildCsvString(urls, cb){
	var masterCsvString = generateNewCsvString();

	async.eachSeries(urls, function(urlObj, callback){

		//while base url with index returns a non-zero length productsElm array keep grabbing a new page 
		iterateThroughSearchResults(urlObj.measure, urlObj.baseUrl, masterCsvString, function(updatedCsvString){
			masterCsvString = updatedCsvString;
			callback();
		})
	}, function(err){
		if(err) console.error(err)

		cb(masterCsvString);
	})
}

// And heres the tiny little function that uses all the previous ones to do big things
function scrapeData(urls, cb){
	buildCsvString(urls, function(masterCsvString){
		
		writeCsvFile(masterCsvString, "electronics.csv", function wroteCsvFile(){
			console.log("Wrote to electronics.csv")
			cb();
		})
	})
}

//"node module.js" will call the following function and execute the scraping algorithm

scrapeData(urls, function(){
	console.log("All done!")
})