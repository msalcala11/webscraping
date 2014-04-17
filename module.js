var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

//An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
var urlArr = [{
			measure: "TVs",
			baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001",
			esUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DTV+Type~Plasma+Flat-Panel%5Etvfeatures_facet%3DSAAS~TV+Features~ENERGY+STAR+Certified&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001"
					}]

//An object of jquery selectors we will be using to find dom elements
var selectors = {
	product: ".hproduct", //assumes you are running a find on the body element
	title: ".info-main h3 a", //assumes that you are running a find() on a single product element
}

module.exports = {
	defineUrls: defineUrls,
	grabPage: grabPage,
	getProducts: getProducts,
	getProductTitle: getProductTitle,
	selectors: defineSelectors(), //An object of jquery selectors we will be using to find dom elements
	urls: defineUrls(), //An array of objects containing the measure name, the baseline url to scrape, and the efficient url to scrape
	defineSelectors: defineSelectors
}

function defineSelectors() { 
	return selectors;
}

function defineUrls(){
	return urlArr;
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