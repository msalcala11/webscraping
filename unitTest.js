var should = require("should")
var _ = require("underscore")
var request = require("request");
var cheerio = require("cheerio");
var csv = require("csv");
var async = require("async");
var m = require("./module.js")

describe("urlArr", function(done){

	it("should have a length greater than one and each object must have no null properties", function(done){
		console.log("starting test")
		var urlArr = m.defineUrls();
		urlArr.length.should.not.equal(0);
		_.each(urlArr, function(item){
			item.measure.should.not.equal(undefined)
			item.esUrl.should.not.equal(undefined)
			item.baseUrl.should.not.equal(undefined)
		})
		done();
	})
})

describe("grabPage", function(done){
	this.timeout(10000);
	var urlArr;

	beforeEach(function(done){
		console.log("starting")
		urlArr = m.defineUrls();
		done();
	})

	it("should return a jquery element of the page being scraped for each es and base url in the urlArr", function(done){
		async.each(urlArr, function(urlObj, callback){
			m.grabPage(urlObj.baseUrl, function($){
				console.log("made into grabpage callback")
				//$.should.not.equal(undefined);
				//$._root.type.should.equal('root'); //test to make sure this is in fact a jquery elm
				console.log("about to grab another page")
				m.grabPage(urlObj.esUrl, function($2){
					// $2.should.not.equal(undefined);
					// $2._root.type.should.equal('root'); //test to make sure this is in fact a jquery elm
					callback();
				})
			})
		}, function(err){
			if(err) console.error("an error occured")
			done();
		})
	})
})

describe("getProducts", function(done){
	this.timeout(10000);
	var bodyArr; // stores all of the jquery elements of all the pages we will be scraping
	// bodyArr.length should be twice as long as the urlArr since each urlArr has an object with 2 urls
	var urlArr;
	beforeEach(function(done){
		console.log("made it here")
		bodyArr = [];
		//urlArr = m.defineUrls();
		// loop through url arr and add each es and base url to the bodyArr
		async.each(m.urls, function(urlObj, callback){
			// lets get the baseUrl
			m.grabPage(urlObj.baseUrl, function($){
				// $.should.not.equal(undefined);
				// $._root.type.should.equal('root'); //test to make sure this is in fact a jquery elm
				bodyArr.push($);
				// now lets get the efficient url
				m.grabPage(urlObj.esUrl, function($2){
					// $2.should.not.equal(undefined);
					// $2._root.type.should.equal('root'); //test to make sure this is in fact a jquery elm
					bodyArr.push($2);
					// next index in urlArr
					callback();
				})
			})
		}, function(err){
			if(err) console.error("an error occured")
			console.log("finished bulding bodyArr")
			bodyArr.length.should.equal(m.urls.length*2)
			done();
		})
	})

	it("should return an array of all product elements on a page", function(done){
		// We will first try with just one body element (why not the first?)
		var bodyElm = bodyArr[0];
		var productsElm = m.getProducts(bodyElm)
		productsElm.length.should.be.greaterThan(0)
		done();
	})


	it("getProductTitle should return the title string of a single product", function(done){
		// We will first try with just one body element (why not the first?)
		var bodyElm = bodyArr[0];

		var productsElm = m.getProducts(bodyElm)
		//Extract the title from the first element
		var titleStr = m.getProductTitle(bodyElm, productsElm[0]);

		titleStr.should.not.equal(undefined)
		isString(titleStr).should.equal(true)
		done();
	})

	it.only("getProductTitle should return the title string of all products", function(done){
		// We will first try with just one body element (why not the first?)
		var bodyElm = bodyArr[0];

		var productsElm = m.getProducts(bodyElm)
		var titleStr;
		//Extract the title from the first element
		_.each(productsElm, function(productElm){
			titleStr = m.getProductTitle(bodyElm, productElm);
			titleStr.should.not.equal(undefined)
			isString(titleStr).should.equal(true)
			console.log(titleStr)
		})


		console.log(m.selectors)
		done();
	})

})

function isString(anything){
	if(typeof anything === "string") return true;
	else return false;
}