/// <reference path="../../typings/index.d.ts" />
/// <reference path="FileTranslator.ts" />
/**
 * Created by steakeye on 19/10/16.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'fs', 'path', 'mkdirp'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var m2n;
    (function (m2n) {
        var FileConverter = (function () {
            function FileConverter(aSource, aTarget, aTranslation) {
                this.setSourceAndTarget(aSource, aTarget);
                this.setTranslation(aTranslation);
            }
            FileConverter.exitWithError = function (aError) {
                console.error(aError);
                process.exit(1);
            };
            FileConverter.prototype.setSourceAndTarget = function (aSource, aTarget) {
                this.source = aSource;
                this.target = aTarget;
            };
            FileConverter.prototype.setTranslation = function (aTranslation) {
                this.translation = aTranslation;
            };
            FileConverter.prototype.convert = function () {
                console.info('Converting:', this.source, 'to', this.target);
                if (this.isTargetSameAsSource()) {
                    this.convertToSource();
                }
                else {
                    this.convertToTarget();
                }
            };
            FileConverter.prototype.isTargetSameAsSource = function () {
                return this.source === this.target;
            };
            FileConverter.prototype.convertToSource = function () {
                var _this = this;
                var inStream = fs.createReadStream(this.source), transformStream = this.getTranslationStream(this.onConversionToSource.bind(this), this.onConversionComplete.bind(this));
                this.buffer = [];
                inStream.pipe(transformStream);
                inStream.on('end', function () {
                    //console.log('inStream.onEnd');
                    var outStream = fs.createWriteStream(_this.target);
                    outStream.write(_this.buffer.join(''), function () {
                        //console.log('outStream.write, what happened?: ', arguments)
                    });
                    _this.buffer.length = 0;
                    _this.buffer = undefined;
                });
            };
            FileConverter.prototype.convertToTarget = function () {
                var _this = this;
                this.ensureValidTarget(function () {
                    var inStream = fs.createReadStream(_this.source), transformStream = _this.getTranslationStream(undefined, _this.onConversionComplete.bind(_this)), outStream = fs.createWriteStream(_this.target);
                    inStream.pipe(transformStream).pipe(outStream);
                });
            };
            FileConverter.prototype.onConversionToSource = function (aNewContent) {
                this.buffer.push(aNewContent);
            };
            FileConverter.prototype.onConversionComplete = function () {
                console.info('Conversion complete for: ', this.source);
            };
            FileConverter.prototype.ensureValidTarget = function (aThen) {
                var _this = this;
                mkdirp(path.parse(this.target).dir, function (aError) {
                    if (aError) {
                        FileConverter.exitWithError(aError);
                    }
                    else {
                        fs.stat(_this.target, function (aErr, aStats) {
                            var errorMessage;
                            if (aStats && aStats.isDirectory()) {
                                errorMessage = FileConverter.ERROR_MESSAGES.fileToDir;
                            }
                            else if (aErr && aErr.errno !== FileConverter.NODE_ERRORS.enoent) {
                                errorMessage = aErr;
                            }
                            if (errorMessage === undefined) {
                                aThen();
                            }
                            else {
                                FileConverter.exitWithError(errorMessage);
                            }
                        });
                    }
                });
            };
            FileConverter.prototype.getTranslationStream = function (aOnTranslation, aOnTranslationComplete) {
                return this.translation.createTranslationStream(aOnTranslation, aOnTranslationComplete);
            };
            FileConverter.NODE_ERRORS = {
                enoent: -2
            };
            FileConverter.ERROR_MESSAGES = {
                fileToDir: "Cannot convert file to directory"
            };
            return FileConverter;
        }());
        m2n.FileConverter = FileConverter;
    })(m2n || (m2n = {}));
    return m2n.FileConverter;
});
