/**
 * Created by steakeye on 06/10/16.
 */
import fs = require('fs');
import through = require('through');

var files = process.argv.slice(2);

files.forEach(function (file) {
    var inStream = fs.createReadStream(file);
    var outStream = fs.createWriteStream(file + '.js');

    outStream.write('module.exports = \'');

    inStream.pipe(through(function (buf) {
        this.queue((buf + '').replace(/'/g, '\\\'').replace(/\r\n|\r|\n/g, '\\n'));
    }, function () {
        this.queue('\';');
    })).pipe(outStream);
});
