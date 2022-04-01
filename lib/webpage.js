'use strict';

const split = require('split');

const parseArchivalMessageArchivalDate = /FILE ARCHIVED ON (\d{2}:\d{2}:\d{2}\ [A-Z][a-z]*\ \d{2}\,\ \d{4}) AND/gm
const parseArchivalMessageRetreaveDate = /INTERNET ARCHIVE ON (\d{2}:\d{2}:\d{2}\ [A-Z][a-z]*\ \d{2}\,\ \d{4})./gm

function fromTo(where, from, to) {
	from = where.search(from)+from.length;
	to   = where.search(to);

	console.log(from, to)

	return where.substr(from, to-from)
}

function parseWebpage(input, callback) {
	let resp = {
		html: null,
		archived: null,
		retreaved: null,
	}

	let html = '';

	input
		// errors handling
		.on('error', function(err) {
			callback(err, null);
		})

		// data
		.on('data', chunk => {
			html += chunk;
		})

		.on('end', _ => {
			const data = html.toString();

			debugger
			
			// doctype, etc.
			resp.html  = fromTo(data, '', '<script src="//archive.org/includes/analytics.js')
			
			// HTML head
			resp.html += fromTo(data, '<!-- End Wayback Rewrite JS Include -->\n', '<!-- BEGIN WAYBACK TOOLBAR INSERT -->')

			// HTML body
			resp.html += fromTo(data, "<!-- END WAYBACK TOOLBAR INSERT -->", "<!--\n     FILE ARCHIVED ON")

			// bottom most meta information:
			const array = data.split("\n")
			const bottom = array.splice(array.length-19,array.length)

			// archived Time
			resp.archived = new Date(parseArchivalMessageArchivalDate.exec(bottom)[1]).getTime()
			resp.retreaved = new Date(parseArchivalMessageRetreaveDate.exec(bottom)[1]).getTime()
			callback(null, resp)
		})
}

module.exports = {
	parseWebpage: parseWebpage,
};
