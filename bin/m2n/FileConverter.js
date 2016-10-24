/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'fs', 'through'], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require('fs');
    var through = require('through');
    var m2n;
    (function (m2n) {
        var FileConverter = (function () {
            function FileConverter(aSource, aTarget) {
                this.setSourceAndTarget(aSource, aTarget);
            }
            FileConverter.prototype.setSourceAndTarget = function (aSource, aTarget) {
                this.source = aSource;
                this.target = aTarget;
            };
            FileConverter.prototype.convert = function () {
                console.info('Converting: ', this.source);
                if (this.isTargetSameAsSource()) {
                    this.convertToSource();
                }
                else {
                    this.convertToTarget();
                }
            };
            FileConverter.prototype.isTargetSameAsSource = function () {
                return this.source == this.target;
            };
            FileConverter.prototype.convertToSource = function () {
                var _this = this;
                var inStream = fs.createReadStream(this.source), outStream, // = fs.createWriteStream(this.target, ),
                //transformStream: through.ThroughStream = this.createTransformStream();,
                data = [], transformStream = inStream.pipe(this.createTransformStream(data));
                //inStream.pipe(transformStream).pipe(outStream);
                inStream.on('open', function (aFileDescriptor) {
                    console.log('inStream.onOpen: ', aFileDescriptor);
                    //outStream = this.createOutputStream(aFileDescriptor);
                    //inStream.pipe(transformStream).pipe(outStream);
                    //transformStream.pipe(outStream);
                });
                inStream.on('data', function (aChunk) {
                    console.log('inStream.onData: ', aChunk);
                });
                inStream.on('end', function () {
                    console.log('inStream.onEnd');
                    var outStream = _this.createOutputStream();
                    outStream.write(data.join(''), function () {
                        console.log('outStream.write, what happened?: ', arguments);
                    });
                });
            };
            FileConverter.prototype.convertToTarget = function () {
                var inStream = fs.createReadStream(this.source), outStream = fs.createWriteStream(this.target), transformStream = this.createTransformStream();
                inStream.pipe(transformStream).pipe(outStream);
                //inStream.pipe(transformStream);
            };
            FileConverter.prototype.createOutputStream = function (aFileDescriptor) {
                var outStream = fs.createWriteStream(this.target, aFileDescriptor ? { fd: aFileDescriptor } : undefined);
                outStream.on('open', function (aDat) {
                    console.log('outStream.data');
                });
                outStream.on('data', function (aDat) {
                    console.log('outStream.data');
                });
                outStream.on('end', function () {
                    console.log('outStream.onEnd');
                });
                return outStream;
            };
            FileConverter.prototype.createTransformStream = function (aDataCache) {
                var converter = this;
                function writeAction(aBuffer) {
                    var conversion, conversionMap = FileConverter.CONVERSION_MAP, convertedText = aBuffer.toString();
                    for (conversion in conversionMap) {
                        var conversionPair = conversionMap[conversion];
                        console.log('conversion: ', conversion);
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
                //TODO: fix this? What do we need to know?
                layouts: { from: /{{<layouts(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% extends "$1.html" %} $2' },
                blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
                includes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
                ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
                ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
            };
            return FileConverter;
        }());
        m2n.FileConverter = FileConverter;
    })(m2n || (m2n = {}));
    return m2n.FileConverter;
});
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
