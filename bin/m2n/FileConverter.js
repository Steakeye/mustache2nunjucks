/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'fs', 'path', 'mkdirp', 'through'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var through = require('through');
    var m2n;
    (function (m2n) {
        var FileConverter = (function () {
            function FileConverter(aSource, aTarget) {
                this.setSourceAndTarget(aSource, aTarget);
            }
            FileConverter.exitWithError = function (aError) {
                console.error(aError);
                process.exit(1);
            };
            FileConverter.prototype.setSourceAndTarget = function (aSource, aTarget) {
                this.source = aSource;
                this.target = aTarget;
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
                var inStream = fs.createReadStream(this.source), outStream, data = [], transformStream = inStream.pipe(this.createTransformStream(data));
                /*inStream.on('open', (aFileDescriptor: number) => {
                    console.log('inStream.onOpen: ', aFileDescriptor);
                });
                inStream.on('data', (aChunk: string) => {
                    console.log('inStream.onData: ', aChunk);
                });*/
                inStream.on('end', function () {
                    //console.log('inStream.onEnd');
                    var outStream = _this.createOutputStream();
                    outStream.write(data.join(''), function () {
                        //console.log('outStream.write, what happened?: ', arguments)
                    });
                });
            };
            FileConverter.prototype.convertToTarget = function () {
                var _this = this;
                this.ensureValidTarget(function () {
                    var inStream = fs.createReadStream(_this.source), transformStream = _this.createTransformStream(), outStream = fs.createWriteStream(_this.target);
                    inStream.pipe(transformStream).pipe(outStream);
                });
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
            FileConverter.prototype.createOutputStream = function (aFileDescriptor) {
                var outStream = fs.createWriteStream(this.target, aFileDescriptor ? { fd: aFileDescriptor } : undefined);
                /*outStream.on('open', (aDat: any) => {
                    console.log('outStream.open');
                });
    
                outStream.on('data', (aDat: any) => {
                    console.log('outStream.data');
                });
    
                outStream.on('end', () => {
                    console.log('outStream.onEnd');
                });*/
                return outStream;
            };
            FileConverter.prototype.createTransformStream = function (aDataCache) {
                var converter = this;
                function writeAction(aBuffer) {
                    var conversion, conversionMap = FileConverter.CONVERSION_MAP, convertedText = aBuffer.toString();
                    for (conversion in conversionMap) {
                        var conversionPair = conversionMap[conversion];
                        //console.log('conversion: ', conversion)
                        convertedText = convertedText.replace(conversionPair.from, conversionPair.to);
                    }
                    this.queue(convertedText);
                    aDataCache && aDataCache.push(convertedText);
                }
                function endAction() {
                    console.info('Conversion complete for: ', converter.source);
                }
                return through(writeAction, endAction);
            };
            FileConverter.CONVERSION_MAP = {
                layouts: { from: /{{<(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% extends "$1.html" %} $2' },
                blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
                includes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
                ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
                ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
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
