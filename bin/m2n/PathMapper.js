/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'glob'], factory);
    }
})(function (require, exports) {
    "use strict";
    var glob = require('glob');
    var m2n;
    (function (m2n) {
        var PathMapper = (function () {
            function PathMapper(aSource, aTarget) {
                this.setSourceAndTarget(aSource, aTarget);
            }
            PathMapper.exitWithError = function (aError) {
                console.error(aError);
                process.exit(1);
            };
            PathMapper.prototype.setSourceAndTarget = function (aSource, aTarget, aGlobPattern) {
                if (aGlobPattern === void 0) { aGlobPattern = "**/*.*"; }
                this.source = aSource;
                this.target = aTarget;
                this.pattern = aGlobPattern;
            };
            PathMapper.prototype.generatePaths = function () {
                var _this = this;
                console.info('Generating paths for: ', this.source, ' to ', this.target);
                var files = glob.sync(this.pattern, { cwd: this.source }), mappedFiles = files.map(function (aFilePath) {
                    var fileFragment = '/' + aFilePath;
                    return {
                        from: _this.source + fileFragment,
                        to: _this.target + fileFragment
                    };
                });
                return mappedFiles;
            };
            PathMapper.ERROR_MESSAGES = {
                error: "error"
            };
            return PathMapper;
        }());
        m2n.PathMapper = PathMapper;
    })(m2n || (m2n = {}));
    return m2n;
});
