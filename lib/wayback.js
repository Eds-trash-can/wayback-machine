'use strict';

var debug = require('debug')('wayback:main'),
	fetch = require('fetch').FetchStream,
	closest = require('./closest'),
	timemap = require('./timemap'),
	webpage = require('./webpage');

// a simple HTTP client wrapper returning a response stream
function request(url, options, callback) {
	var debug = require('debug')('wayback:http');
	debug('req', url);

	callback = typeof callback === 'undefined' ? options : callback;

	// @see https://www.npmjs.com/package/fetch
	var stream = new fetch(url, typeof options === 'object' ? options : undefined);

	stream.on('error', function(err) {
		debug('error', err);
		callback(err, null);
	});

	stream.on('meta', function(meta) {
		debug('resp', 'HTTP ' + meta.status);
		debug('resp', meta.responseHeaders);
		callback(null, stream);
	});
}

function getClosest(url, options, callback) {
	var closestUrl = 'http://archive.org/wayback/available?url=' + encodeURIComponent(url);
	debug('closest', url);
	request(closestUrl, options, function(err, res) {
		callback = typeof callback === 'undefined' ? options : callback;

		if (err) {
			callback(err, null);
		}
		else {
			closest.parseClosest(res, callback);
		}
	});
}

function getClosestPromise(url, options) {
	return new Promise(resolve => {
		getClosest(url, options, (err, res) =>
			resolve(err, res)
		)
	})
}

function getTimeline(url, callback) {
	var timelineUrl = 'http://web.archive.org/web/timemap/link/' + url;
	debug('timeline', url);

	request(timelineUrl, function(err, res) {
		if (err) {
			callback(err, null);
			return;
		}

		timemap.parseTimemap(res, callback);
	});
}

function getTimelinePromise(url) {
	return new Promise(resolve => getTimeline(url, (err, data) => resolve(err ? err : data)))
}

function getWebpage(url, callback) {
	request(url, (err, res) => {
		if(err) {
			callback(err, null);
			return;
		}

		webpage.parseWebpage(res, callback);
	})
}

function getWebpagePromise(url) {
	return new Promise(resolve => getWebpage(url, (err, data) => resolve(err ? err : data)))
}

module.exports = {
	getClosest: getClosest,
	getClosestPromise: getClosestPromise,
	getTimeline: getTimeline,
	getTimelinePromise: getTimelinePromise,
	getWebpage: getWebpage,
	getWebpagePromise: getWebpagePromise,
};
