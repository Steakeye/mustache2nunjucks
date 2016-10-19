#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

/**
 * Created by steakeye on 06/10/16.
 */
const fs = require('fs');
const path = require('path');

import through = require('through');
import cliArgs = require('commander');
//import filesCopier = require('copyfiles');
import FileConverter = require('./m2n/FileConverter');


/*
function setSource(aPath:string) {
    if(source = aPath) {

    }
    return aPath;
}
function setTarget(aPath:string) {
    target = aPath
    return aPath;
}
*/
function processOptions(aOptions:commander.IExportedCommand) {
    console.log('processOptions: ', aOptions)
}

class M2NService {
    constructor(sourcePath:string = process.cwd(), outputPath?:string) {
        console.log("M2NService")
        console.log(arguments)
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
    }

    private sourcePath:string;
    private outputPath:string;
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
    .option('-s, --source [path]', 'Directory or file to convert', process.cwd())
    .option('-o, --output [path]', 'Location to save converted file(s)')
    .parse(process.argv);

function ConvertFiles() {
    let commands = (<any>cliArgs).commands[0];
    console.log("source:", (<any>cliArgs).source)
    console.log("output:", (<any>cliArgs).output)
    processOptions(commands.source)
    processOptions(commands.output)
    let m2nService = new M2NService(commands.source, commands.output)
}

ConvertFiles();