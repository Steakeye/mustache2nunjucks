/// <reference path="../node_modules/commander/index.js" />


/**
 * Created by steakeye on 06/10/16.
 */
import fs = require('fs');
import through = require('through');
import cliArgs = require('commander');
import filesCopier = require('copyfiles');

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

//Set up the CLI interface then process the arguments in order to get the data/instructions
cliArgs.version('0.0.1')
    .option('-s, --source', 'TODO')
    .option('-o, --output', 'TODO')
    .parse(process.argv);

function ConvertFiles() {}

ConvertFiles()