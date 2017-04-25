var stream = require('stream');
var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));

var assert = require('assert');
var util = require('util');

var pipeStreams = require('./index');

var INPUT = __dirname + '/fixtures/input.txt';
var OUTPUT = __dirname + '/fixtures/output.txt';

var ThrowTransform = function() {
  stream.Transform.call(this);
}

ThrowTransform.message = 'Error! Error!';

util.inherits(ThrowTransform, stream.Transform);

ThrowTransform.prototype._transform = function(chunk, encoding, cb) {
  cb(new Error(ThrowTransform.message));
};

var UpcaseTransform = function() {
  stream.Transform.call(this);
}

util.inherits(UpcaseTransform, stream.Transform);

UpcaseTransform.prototype._transform = function(chunk, encoding, cb) {
  this.push(chunk.toString().toUpperCase());

  cb();
};

describe('pipeStreams', function() {
  beforeEach(function() {
    return fs.unlinkAsync(OUTPUT)
      .catch(function(err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      });
  });

  it('can do basic piping', function() {
    var input = fs.createReadStream(INPUT);
    var output = fs.createWriteStream(OUTPUT);

    return pipeStreams([input, output])
      .then(function(destination) {
        assert.equal(output, destination, 'Promise resolves to destination');

        return fs.readFileAsync(OUTPUT)
      })
      .then(function(data) {
        assert.equal(data.toString().trim(), 'foobar');
      });
  });

  ['stdout', 'stderr'].forEach(function(stdio) {
    it('can pipe to ' + stdio, function() {
      var input = fs.createReadStream(INPUT);
      return pipeStreams([input, process[stdio]]);
    });
  });

  it('can handle errors from stream', function() {
    var input = fs.createReadStream('bad');
    var output = fs.createWriteStream(OUTPUT);

    return pipeStreams([input, output])
      .catch(function(err) {
        assert(err);
        assert.equal(err.streamError.code, 'ENOENT');
        assert.equal(err.stream, input);
      });
  });

  it('can handle errors from target', function() {
    var input = fs.createReadStream(INPUT);
    var output = fs.createWriteStream('/bad');

    pipeStreams([input, output]).catch(function(err) {
      assert(err);
      assert.equal(err.streamError.code, 'EACCES');
    });
  });

  it('can pipe via transforms', function() {
    var input = fs.createReadStream(INPUT);
    var output = fs.createWriteStream(OUTPUT);

    return pipeStreams([input, new UpcaseTransform(), output])
      .then(function() {
        return fs.readFileAsync(OUTPUT);
      })
      .then(function(data) {
        assert.equal(data.toString().trim(), 'FOOBAR');
      });
  });

  it('can handle errors from transforms', function() {
    var input = fs.createReadStream(INPUT);
    var output = fs.createWriteStream(OUTPUT);

    pipeStreams([input, new ThrowTransform(), output])
      .catch(function(err) {
        assert(err);
        assert.equal(err.streamError.message, ThrowTransform.message);
      });
  });
});
