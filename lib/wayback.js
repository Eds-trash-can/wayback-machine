'use strict';

var debug = require('debug')('wayback:main'),
	http = require('http'),
	timemap = require('./timemap');

// a simple HTTP client
function request(url, callback) {
	var debug = require('debug')('wayback:http');
	debug('req', url);

	var req = http.get(url, function(res) {
		debug('resp', 'HTTP ' + res.statusCode);
		debug('resp', res.headers);

		if (res.statusCode === 200) {
			callback(null, res);
		}
		else {
			callback(new Error('HTTP ' + res.statusCode), null);
		}
	});

	req.on('error', function(err) {
		debug('error', err);
		callback(err, null);
	});
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

module.exports = {
	getTimeline: getTimeline
};
