var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var csv = require("csv");
var async = require("async");

module.exports = {
	one: one,
	zero: zero,
	defineUrls: defineUrls,
	grabPage: grabPage,
	getProducts: getProducts
}

function one() {
	return 1;
}


function zero(){
	return 0;
}

function defineUrls(){
	console.log("defining urls")
	var urlArr = [{
			measure: "TVs",
			baseUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DSAAS~TV+Type~Plasma+Flat-Panel&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001",
			esUrl: "http://www.bestbuy.com/site/olstemplatemapper.jsp?_dyncharset=UTF-8&_dynSessConf=5137597497672723997&id=pcat17071&type=page&ks=960&st=categoryid%24abcat0101001&sc=Global&cp=1&sp=%2Bcurrentprice+skuidsaas&qp=tvtype_facet%3DTV+Type~LED+Flat-Panel%5Etvscreensize_facet%3DTV+Screen+Size~28%22+-+32%22%5Etvscreensize_facet%3DTV+Screen+Size~33%22+-+39%22%5Etvscreensize_facet%3DTV+Screen+Size~40%22+-+45%22%5Etvscreensize_facet%3DTV+Screen+Size~46%22+-+49%22%5Etvscreensize_facet%3DTV+Screen+Size~50%22+-+54%22%5Etvscreensize_facet%3DTV+Screen+Size~55%22+-+59%22%5Etvscreensize_facet%3DTV+Screen+Size~60%22+-+64%22%5Etvscreensize_facet%3DTV+Screen+Size~65%22+and+Up%5Etvtype_facet%3DTV+Type~LCD+Flat-Panel%5Etvtype_facet%3DTV+Type~Plasma+Flat-Panel%5Etvfeatures_facet%3DSAAS~TV+Features~ENERGY+STAR+Certified&list=y&usc=All+Categories&nrp=50&fs=saas&iht=n&seeAll=&browsedCategory=abcat0101001"
					}]

	return urlArr;
}

function grabPage(url, cb){
	console.log("grabbing page")
	request({
	  uri: url,
	  headers: {
        	'User-Agent': 'Mozilla/5.0'
    	}
	}, function(error, response, body) {
	  	var $ = cheerio.load(body);
	  	// console.log("h product")
	  	// console.log($(".hproduct"))
	  	// console.log("end hproduct")
	  	//console.log($.html())
	  	//return 
	  	console.log("grabbed page")
	  	cb($);
	 })
}

function getProducts($){
	console.log("getting product")
	var productsElm = $(".hproduct")//.nextAll();
	return productsElm;
}