var assert = require('assert'),
	wayback = require('../');

describe('npm module', function() {
	it('should provide an API', function() {
		assert.equal(typeof wayback, 'object');
	});
});
