#!/usr/bin/env node
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'fs', 'path', 'commander', './m2n/FileConverter', './m2n/FormatTranslator', './m2n/PathMapper'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    var cliArgs = require('commander');
    var FileConverter_1 = require('./m2n/FileConverter');
    var FormatTranslator_1 = require('./m2n/FormatTranslator');
    var PathMapper_1 = require('./m2n/PathMapper');
    var OutputType;
    (function (OutputType) {
        OutputType[OutputType["FILE"] = 0] = "FILE";
        OutputType[OutputType["FOLDER"] = 1] = "FOLDER";
    })(OutputType || (OutputType = {}));
    var M2NService = (function () {
        function M2NService(sourcePath, outputPath, configPath) {
            // console.log("M2NService");
            // console.log(arguments);
            if (!outputPath) {
                this.assignSourceToBothPaths(sourcePath);
            }
            else {
                this.assignPathValues(sourcePath, outputPath);
            }
            this.setOutputType();
            this.tryToLoadConfig(configPath);
        }
        M2NService.prototype.convertFiles = function () {
            var _this = this;
            var fileConverter, pathMapper, fileMappings, customTranslations = this.customConfig ? this.customConfig.customTranslations : undefined, conversionJobs = [];
            var onConversion = function (aError, aFileConversion) {
                var jobListIdx;
                if (aError) {
                    _this.exitWithError(aError);
                }
                else {
                    jobListIdx = conversionJobs.lastIndexOf(aFileConversion);
                    if (jobListIdx !== -1) {
                        conversionJobs.splice(jobListIdx, 1);
                        if (!conversionJobs.length) {
                            console.log(M2NService.CONVERSION_COMPLETE);
                            process.exit(0);
                        }
                    }
                }
            };
            function convert(aFrom, aTo) {
                conversionJobs.push(fileConverter = new FileConverter_1.default(aFrom, aTo, new FormatTranslator_1.FormatTranslator(customTranslations)));
                fileConverter.convert(onConversion);
            }
            if (this.outputType === OutputType.FILE) {
                //Just use the file converter on one source
                convert(this.sourcePath, this.outputPath);
            }
            else {
                //Assume is directory
                //Get all the files in the directory
                pathMapper = new PathMapper_1.PathMapper(this.sourcePath, this.outputPath);
                //Create mappings to desitnations
                fileMappings = pathMapper.generatePaths();
                //Iterate over list of files, converting one by one
                fileMappings.forEach(function (aMapping) {
                    convert(aMapping.from, aMapping.to);
                });
            }
        };
        M2NService.prototype.tryToLoadConfig = function (aConfigPath) {
            var resolvedPath = this.resolveAndValidatePath(aConfigPath); /*,
                configJson:Config;*/
            if (resolvedPath.valid) {
                try {
                    this.customConfig = require(resolvedPath.path);
                }
                catch (aErr) {
                    this.exitWithError(aErr);
                }
            }
            else if (resolvedPath.path !== M2NService.DEFAULT_CONFIG_PATH) {
                this.exitWithError(M2NService.CONFIG_PATH_NOT_FOUND);
            }
        };
        M2NService.prototype.resolveAndValidatePath = function (aPathToResolve) {
            var resolvedSource = path.resolve(aPathToResolve);
            return {
                path: resolvedSource,
                valid: fs.existsSync(resolvedSource)
            };
        };
        M2NService.prototype.resolveAndAssignSource = function (aPath) {
            return (this.sourcePath = this.resolveAndValidateSourcePath(aPath));
        };
        M2NService.prototype.assignSourceToBothPaths = function (aPath) {
            this.outputPath = this.resolveAndAssignSource(aPath);
        };
        M2NService.prototype.assignPathValues = function (aSourcePath, aTargetPath) {
            this.resolveAndAssignSource(aSourcePath);
            this.outputPath = path.resolve(aTargetPath);
        };
        M2NService.prototype.resolveAndValidateSourcePath = function (aPath) {
            var resolvedPath = this.resolveAndValidatePath(aPath);
            if (!resolvedPath.valid) {
                this.exitWithError(M2NService.SOURCE_PATH_NOT_FOUND);
            }
            return resolvedPath.path;
        };
        M2NService.prototype.setOutputType = function () {
            this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE : OutputType.FOLDER;
        };
        M2NService.prototype.exitWithError = function (aError) {
            console.error(aError);
            process.exit(1);
        };
        M2NService.DEFAULT_CONFIG_PATH = process.cwd() + '/m2nconfig.json';
        M2NService.SOURCE_PATH_NOT_FOUND = "Source path not found";
        M2NService.CONFIG_PATH_NOT_FOUND = "Config path not found";
        M2NService.CONVERSION_COMPLETE = "\nConversions completed!";
        return M2NService;
    }());
    //Set up the CLI interface then process the arguments in order to get the data/instructions
    cliArgs.version('0.0.1')
        .option('-S, --source [path]', 'Directory or file to convert', process.cwd())
        .option('-O, --output [path]', 'Location to save converted file(s)')
        .option('-C, --config [path]', 'Location of json config file to load. Defaults to m2nconfig.json in root', M2NService.DEFAULT_CONFIG_PATH)
        .parse(process.argv);
    var m2nService = new M2NService(cliArgs.source, cliArgs.output, cliArgs.config);
    m2nService.convertFiles();
});
