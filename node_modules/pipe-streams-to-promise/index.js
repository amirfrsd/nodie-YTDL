var Bluebird = require("bluebird");

/**
 * Returns a promise that resolves to the final destination stream
 *
 *
 * @param {Array<Stream>} streams An array of streams to pipe together and unify
 *                                into a promise
 * @return {Promise}              Resolves to the destination stream
 *
 */
var pipeStreams = function(streams) {
  var finished = Bluebird.all(streams.map(function(stream, index, numStreams) {
    return new Bluebird(function(resolve, reject){
      stream.on('error', function(streamErr) {
        var err = new Error(streamErr.message);
        err.stream = stream;
        err.streamError = streamErr;
        reject(err);
      });

      // process.stdout and process.stderr are not closed or ended
      // after piping like other streams. So we must resolve them
      // manually.
      if (stream === process.stdout || stream === process.stderr) {
        // These streams aren't ended, closed, finished, so manually resolve them
        resolve();
      } else if (index === 0) {
        // This stream is only being read; go for end event
        stream.on('end', resolve);
      } else {
        // This stream is a writeable stream, so wait for finish event
        stream.on('finish', resolve);
      }
    });
  }));

  // Pipe the streams together
  var destination = streams.reduce(function(readable, writeable) {
    if (readable) {
      readable.pipe(writeable);
    }

    return writeable;
  });

  return finished.then(function() {
    return destination;
  });
};

module.exports = pipeStreams;
