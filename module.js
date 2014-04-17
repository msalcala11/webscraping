var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

//An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
var urls = [{
			measure: "ENERGY STAR Television",
			baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001",
			esUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DTV+Type~Plasma+Flat-Panel%5Etvfeatures_facet%3DSAAS~TV+Features~ENERGY+STAR+Certified&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001"
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
	buildCsvString: buildCsvString
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
	return productTitleStr;
}

function getProductPrice(bodyElm, productElm){
	var productPriceStr = bodyElm(productElm).find(selectors.price).text()
	var noDollarSign = productPriceStr.replace("$", "");
	// Let's remove the dollar sign before insertion into the csv file

	// If a no price element was found matching the price selector passed in above,
	// then an empty string is returned
	return noDollarSign;
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
	var updatedCsvString = csvString + "'" + category + "," + price + "," + energyStar + "," + name + "," + source + '\n';
	return updatedCsvString;
}

function buildCsvString(urls, cb){
	var masterCsvString = generateNewCsvString();

	async.each(urls, function(urlObj, callback){

		grabPage(urlObj.baseUrl, function gotPage(baseBody){

			var productsElm = getProducts(baseBody);
			masterCsvString = addCsvRow(masterCsvString, urlObj.measure, getProductPrice(baseBody, productsElm[0]), isEnergyStar(baseBody, productsElm[0]), getProductTitle(baseBody, productsElm[0]), getProductLink(baseBody, productsElm[0]))
			callback();
		})
	}, function(err){
		if(err) console.error(err)
		cb(masterCsvString);
	})
}