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
    var fs = require('fs');
    var path = require('path');
    var cliArgs = require('commander');
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
    function processOptions(aOptions) {
        console.log('processOptions: ', aOptions);
    }
    var M2NService = (function () {
        function M2NService(sourcePath, outputPath) {
            if (sourcePath === void 0) { sourcePath = process.cwd(); }
            console.log("M2NService");
            console.log(arguments);
            this.sourcePath = sourcePath;
            this.outputPath = outputPath;
        }
        return M2NService;
    }());
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
        var commands = cliArgs.commands[0];
        console.log("source:", cliArgs.source);
        console.log("output:", cliArgs.output);
        processOptions(commands.source);
        processOptions(commands.output);
        var m2nService = new M2NService(commands.source, commands.output);
    }
    ConvertFiles();
});
