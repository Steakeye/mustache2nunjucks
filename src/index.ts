#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

/**
 * Created by steakeye on 06/10/16.
 */
import fs = require('fs');
import through = require('through');
import cliArgs = require('commander');
//import filesCopier = require('copyfiles');

let source:string = process.cwd();
let target:string = source

function setSource(aPath:string) {
    if(source = aPath) {

    }
    return aPath;
}
function setTarget(aPath:string) {
    target = aPath
    return aPath;
}
function processOptions(aOptions:commander.IExportedCommand) {
    console.log('processOptions: ', aOptions)
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
    .command('')
    .option('-s, --source [path]', 'Directory or file to convert', undefined, source)
    .option('-o, --output [path]', 'Location to save converted file(s)', undefined)
    .parse(process.argv);

function ConvertFiles() {
    let commands = (<any>cliArgs).commands[0];
    console.log("source:", source)
    console.log("target:", target)
    /*processOptions(cliArgs)*/
    /*processOptions((<any>cliArgs).options)
    processOptions((<any>cliArgs).commands)
    processOptions((<any>cliArgs).source)
    processOptions((<any>cliArgs).output)*/
    processOptions(commands.source)
    processOptions(commands.output)
}

ConvertFiles();