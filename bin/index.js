#!/usr/bin/env node
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'commander', './m2n/FileConverter'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    var cliArgs = require('commander');
    var FileConverter = require('./m2n/FileConverter');
    function processOptions(aOptions) {
        console.log('processOptions: ', aOptions);
    }
    var OutputType;
    (function (OutputType) {
        OutputType[OutputType["FILE"] = 0] = "FILE";
        OutputType[OutputType["FOLDER"] = 1] = "FOLDER";
    })(OutputType || (OutputType = {}));
    var M2NService = (function () {
        function M2NService(sourcePath, outputPath) {
            if (sourcePath === void 0) { sourcePath = process.cwd(); }
            console.log("M2NService");
            console.log(arguments);
            if (!outputPath) {
                this.assignSourceToBothPaths(sourcePath);
            }
            else {
                this.assignPathValues(sourcePath, outputPath);
            }
            this.setOutputType();
        }
        M2NService.prototype.convertFiles = function () {
            var fileConverter;
            if (this.outputType === OutputType.FILE) {
                //Just use the file converter on one source
                fileConverter = new FileConverter(this.sourcePath, this.outputPath);
                fileConverter.convert();
            }
            else {
            }
        };
        /*    private sanityCheckPaths(aSourcePath: string, aTargetPath: string): boolean {
                let tCheckPassed = false;
        
                let sourceExt: string = path.parse(aSourcePath).ext;
                let targetExt: string = path.parse(aTargetPath).ext;
        
                if(targetExt.length && !sourceExt.length) {
                    //If the target is appears to be a file while the source isn't then we need to be prepared to through an error
                    //We need to check that the source is actually a file or that the t
        
                } else {
                    tCheckPassed = true;
                }
        
                return tCheckPassed;
            }*/
        M2NService.prototype.resolveAndAssignSource = function (aPath) {
            var resolvedSource = path.resolve(aPath);
            this.validatePath(resolvedSource);
            return (this.sourcePath = resolvedSource);
        };
        M2NService.prototype.assignSourceToBothPaths = function (aPath) {
            this.outputPath = this.resolveAndAssignSource(aPath);
        };
        M2NService.prototype.assignPathValues = function (aSourcePath, aTargetPath) {
            this.resolveAndAssignSource(aSourcePath);
            this.outputPath = path.resolve(aTargetPath);
        };
        M2NService.prototype.validatePath = function (aPath) {
            var pathExists = fs.existsSync(aPath);
            if (!pathExists) {
                this.exitWithError(M2NService.PATH_NOT_FOUND);
            }
        };
        M2NService.prototype.setOutputType = function () {
            this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE : OutputType.FOLDER;
        };
        M2NService.prototype.exitWithError = function (aError) {
            console.error(aError);
            process.exit(1);
        };
        M2NService.PATH_NOT_FOUND = "Source path not found";
        return M2NService;
    }());
    //Set up the CLI interface then process the arguments in order to get the data/instructions
    cliArgs.version('0.0.1')
        .option('-s, --source [path]', 'Directory or file to convert', process.cwd())
        .option('-o, --output [path]', 'Location to save converted file(s)')
        .parse(process.argv);
    function ConvertFiles() {
        var m2nService = new M2NService(cliArgs.source, cliArgs.output);
        m2nService.convertFiles();
    }
    ConvertFiles();
});
