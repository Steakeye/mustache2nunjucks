#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

/**
 * Created by steakeye on 06/10/16.
 */
import fs = require('fs');
import through = require('through');
import cliArgs = require('commander');
//import filesCopier = require('copyfiles');

var files = process.argv.slice(2);
let source:string = process.cwd();
let target:string = source

function setSource(aPath:string) {
    source = aPath
}
function setTarget(aPath:string) {
    target = aPath
}
/*files.forEach(function (file) {
    var inStream = fs.createReadStream(file);
    var outStream = fs.createWriteStream(file + '.js');

    outStream.write('module.exports = \'');

    inStream.pipe(through(function (buf) {
        this.queue((buf + '').replace(/'/g, '\\\'').replace(/\r\n|\r|\n/g, '\\n'));
    }, function () {
        this.queue('\';');
    })).pipe(outStream);
});*/

//Set up the CLI interface then process the arguments in order to get the data/instructions
cliArgs.version('0.0.1')
    .option('-s, --source [path]', 'Directory or file to convert', setSource)
    .option('-o, --output [path]', 'Location to save converted file(s)', setTarget)
    .parse(process.argv);

function ConvertFiles() {
    console.log("source:", source)
    console.log("target:", target)
    console.log("files?:", files)
}

ConvertFiles();