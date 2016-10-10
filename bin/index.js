#!/usr/bin/env node
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'fs', 'through', 'commander'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var through = require('through');
    var cliArgs = require('commander');
    //import filesCopier = require('copyfiles');
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
    function ConvertFiles() {
        console.log("CWD:", process.cwd());
    }
    ConvertFiles();
});
