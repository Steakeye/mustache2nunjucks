#!/usr/bin/env node
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'commander'], factory);
    }
})(function (require, exports) {
    "use strict";
    var cliArgs = require('commander');
    //import filesCopier = require('copyfiles');
    var source = process.cwd();
    var target = source;
    function setSource(aPath) {
        if (source = aPath) {
        }
        return aPath;
    }
    function setTarget(aPath) {
        target = aPath;
        return aPath;
    }
    function processOptions(aOptions) {
        console.log('processOptions: ', aOptions);
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
        var commands = cliArgs.commands[0];
        console.log("source:", source);
        console.log("target:", target);
        /*processOptions(cliArgs)*/
        /*processOptions((<any>cliArgs).options)
        processOptions((<any>cliArgs).commands)
        processOptions((<any>cliArgs).source)
        processOptions((<any>cliArgs).output)*/
        processOptions(commands.source);
        processOptions(commands.output);
    }
    ConvertFiles();
});
