var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");
var fs = require("fs");

//An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
var urls = [{
				measure: "ENERGY STAR Television",
				//baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=",

						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=1
						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=2
						  // http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=categoryid%24abcat0101001&sc=Global&nrp=100&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&usc=All+Categories&fs=saas&browsedCategory=abcat0101001&seeAll=&gf=y&cp=3	
				esUrl: "does not matter"//"http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DTV+Type~Plasma+Flat-Panel%5Etvfeatures_facet%3DSAAS~TV+Features~ENERGY+STAR+Certified&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001"
			},
			{
				measure: "ENERGY STAR Computer",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=pcmcat138500050001_categoryid%24abcat0502000&sc=Global&nrp=50&sp=-bestsellingsort+skuidsaas&qp=SAAS~&usc=All+Categories&fs=saas&browsedCategory=pcmcat138500050001&seeAll=&gf=y&cp=",
				esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Computer",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=pcmcat138500050001_categoryid%24abcat0502000&sc=Global&nrp=50&sp=-bestsellingsort+skuidsaas&qp=SAAS~&usc=All+Categories&fs=saas&browsedCategory=pcmcat138500050001&seeAll=&gf=y&cp=",
				esUrl: "does not matter"
			},
			{
				measure: "ENERGY STAR Monitor",
				baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17071&type=page&st=pcmcat143700050048_categoryid%24abcat0509000&sc=Global&nrp=50&sp=%2Bcurrentprice+skuidsaas&qp=aspectratio_facet%3DAspect+Ratio~16%3A9%5Easpectratio_facet%3DAspect+Ratio~16%3A10%5Easpectratio_facet%3DAspect+Ratio~5%3A4%5Easpectratio_facet%3DAspect+Ratio~4%3A3%5Easpectratio_facet%3DAspect+Ratio~21%3A9%5Easpectratio_facet%3DAspect+Ratio~4%3A3+and+16%3A9%5Econdition_facet%3DSAAS~Condition~New&usc=All+Categories&fs=saas&browsedCategory=pcmcat143700050048&seeAll=%2CMaximum_Resolution&gf=y&cp=1",
				esUrl: "does not matter"
			}]

//An object of jquery selectors we will be using to find dom elements
var selectors = {
	product: ".hproduct", //assumes you are running a find on the body element
	title: ".info-main h3 a", //assumes that you are running a find() on a single product element
	price: ".info-side div h4 span",
	link: ".info-main h3 a",
	energyStar: ".info-main div.description font"
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
	//console.log("grabbing page")
	request({
	  uri: url,
	  headers: {
        	'User-Agent': 'Mozilla/5.0'
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
	//console.log(selectors.link)
	var productLinkStr = bodyElm(productElm).find(selectors.link).attr('href')
	//console.log(productLinkStr)
	return "http://www.bestbuy.com" + productLinkStr;
}

function isEnergyStar(bodyElm, productElm) {
	//searches dom to determine whether the product being examined is energy star or not
	var energyStarStr = bodyElm(productElm).find(selectors.energyStar).text();
	//return energyStarStr;
	if(energyStarStr.indexOf("ENERGY STAR Certified") === -1) return false;
	else return true;
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
	//console.log(csvString)
	// csv()
	// 	.from(csvString)
	// 	.to('./' + filename)
	// 	.on('end', function() {
	//     	console.log('Wrote to ' + filename);
	//     	cb();
	//   	})
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
	    function (callback) {

	    	// append the page number to the search url and get the jquery body
	        grabPage(searchURL + pageNum, function gotPage(baseBody){

				var productsElm = getProducts(baseBody);
				console.log("measure: " + measureName)
				console.log("pageNum: " + pageNum)

				// If no results showed up on this page then we need to exit the loop
				if(productsElm.length === 0) {
					noMoreResults = true;
					return callback();
				}

				// If there are results on the page then we need to scrape them and add them to the csv string
				_.each(productsElm, function(productElm){
					csvString = addCsvRow(csvString, 
												measureName,
												getProductPrice(baseBody, productElm), 
												isEnergyStar(baseBody, productElm), 
												getProductTitle(baseBody, productElm), 
												getProductLink(baseBody, productElm)     
												);
				})
				pageNum++;
				return callback()
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
		//console.log(masterCsvString)
		cb(masterCsvString);
	})
}


// function buildCsvString(urls, cb){
// 	var masterCsvString = generateNewCsvString();

// 	async.each(urls, function(urlObj, callback){

// 		//while base url with index returns a non-zero length productsElm array keep grabbing a new page 

// 		grabPage(urlObj.baseUrl, function gotPage(baseBody){

// 			var productsElm = getProducts(baseBody);
// 			_.each(productsElm, function(productElm){
// 				masterCsvString = addCsvRow(masterCsvString, 
// 											urlObj.measure,
// 											getProductPrice(baseBody, productElm), 
// 											isEnergyStar(baseBody, productElm), 
// 											getProductTitle(baseBody, productElm), 
// 											getProductLink(baseBody, productElm)     
// 											);
// 			})

// 			grabPage(urlObj.esUrl, function gotPage(esBody){

// 				var productsElm = getProducts(esBody);
// 				_.each(productsElm, function(productElm){
// 					masterCsvString = addCsvRow(masterCsvString, 
// 												urlObj.measure,
// 												getProductPrice(esBody, productElm), 
// 												isEnergyStar(esBody, productElm), 
// 												getProductTitle(esBody, productElm), 
// 												getProductLink(esBody, productElm)     
// 												);
// 				})
				
// 				callback();
// 			})

// 		})
// 	}, function(err){
// 		if(err) console.error(err)
// 		//console.log(masterCsvString)
// 		cb(masterCsvString);
// 	})
// }

function scrapeData(urls, cb){
	buildCsvString(urls, function(masterCsvString){
		
		writeCsvFile(masterCsvString, "electronics.csv", function wroteCsvFile(){
			console.log("all done!")
			cb();
		})
	})
}