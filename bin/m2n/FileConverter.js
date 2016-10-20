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
                var inStream = fs.createReadStream(this.source), outStream = fs.createWriteStream(this.target), transformStream = this.createTransformStream();
                inStream.pipe(transformStream).pipe(outStream);
            };
            FileConverter.prototype.createTransformStream = function () {
                function writeAction(aBuffer) {
                    this.queue((aBuffer + '').replace(/'/g, '\\\'').replace(/\r\n|\r|\n/g, '\\n'));
                }
                function endAction() {
                    this.queue('\';');
                }
                return through(writeAction, endAction);
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
