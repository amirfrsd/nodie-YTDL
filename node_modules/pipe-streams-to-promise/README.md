# pipe-streams-to-promise
Pipes an array of streams together and returns a promise. Checks for any errors on the steams.

Heavily inspired by, and test cases taken from,
[epeli](https://github.com/epeli)'s
[promisePipe](https://github.com/epeli/node-promisepipe)

### Usage

```
var pipeStreams = require('pipe-streams-to-promise');

var fs = require('fs');
var zlib = require('zlib');

var gzip = zlib.createGzip();
var readStream = fs.createReadStream('myfile.txt');
var writeStream = fs.createWriteStream('myfile.txt.gz');


pipeStreams([
  readStream,
  gzip,
  writeStream
]).then(function(writeStream) {
  console.log('Done compressing.');
}).catch(function(err) {
  console.error('Ran into an error:', err);
});
```
