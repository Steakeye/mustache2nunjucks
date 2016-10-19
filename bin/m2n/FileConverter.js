/**
 * Created by steakeye on 19/10/16.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var m2n;
    (function (m2n) {
        var FileConverter = (function () {
            function FileConverter() {
            }
            return FileConverter;
        }());
        m2n.FileConverter = FileConverter;
    })(m2n || (m2n = {}));
    return m2n.FileConverter;
});
