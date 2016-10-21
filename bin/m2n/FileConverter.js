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
                var inStream = fs.createReadStream(this.source), 
                //outStream: fs.WriteStream = fs.createWriteStream(this.target),
                transformStream = this.createTransformStream();
                //inStream.pipe(transformStream).pipe(outStream);
                inStream.pipe(transformStream);
            };
            FileConverter.prototype.createTransformStream = function () {
                var converter = this;
                function writeAction(aBuffer) {
                    var conversion, conversionMap = FileConverter.CONVERSION_MAP, convertedText = aBuffer.toString();
                    for (conversion in conversionMap) {
                        var conversionPair = conversionMap[conversion];
                        console.log('conversion: ', conversion);
                        convertedText = convertedText.replace(conversionPair.from, conversionPair.to);
                    }
                    this.queue(convertedText);
                }
                function endAction() {
                    console.info('Conversion complete for: ', converter.source);
                }
                return through(writeAction, endAction);
            };
            FileConverter.CONVERSION_MAP = {
                layouts: { from: /{{<layouts(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% extends "$1.html" %} $2' },
                blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
                incliudes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
                ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
                ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
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
