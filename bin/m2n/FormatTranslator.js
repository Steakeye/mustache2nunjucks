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
        define(["require", "exports", 'path', 'through'], factory);
    }
})(function (require, exports) {
    "use strict";
    var path = require('path');
    var through = require('through');
    var m2n;
    (function (m2n) {
        var FormatTranslator = (function () {
            function FormatTranslator(aCustomConversions) {
                if (aCustomConversions instanceof Array) {
                    this.customConversions = aCustomConversions;
                    this.attemptModuleInclusion();
                }
            }
            FormatTranslator.exitWithError = function (aError) {
                console.error(aError);
                process.exit(1);
            };
            FormatTranslator.prototype.createTranslationStream = function (aOnWrite, aOnEnd) {
                var self = this;
                function handleRegexReplacement(aOriginal, aMatcher, aReplacement) {
                    var updated;
                    while (updated !== aOriginal) {
                        updated = aOriginal.replace(aMatcher, aReplacement);
                        if (updated !== aOriginal) {
                            aOriginal = updated;
                            updated = undefined;
                        }
                    }
                    return updated;
                }
                function writeAction(aBuffer) {
                    var conversion, conversionMap = FormatTranslator.CONVERSION_MAP, originalText = aBuffer.toString(), customTranslations = self.customConversions;
                    for (conversion in conversionMap) {
                        var conversionPair = conversionMap[conversion];
                        originalText = handleRegexReplacement(originalText, conversionPair.from, conversionPair.to);
                    }
                    if (customTranslations) {
                        customTranslations.forEach(function (aValue) {
                            var func = aValue.moduleFunc;
                            try {
                                if (func) {
                                    originalText = func(originalText);
                                }
                                else if (aValue.func) {
                                    func = Function.apply(undefined, aValue.func);
                                    originalText = func(originalText);
                                }
                                else {
                                    originalText = handleRegexReplacement(originalText, new RegExp(aValue.regExp, FormatTranslator.DEFAULT_FLAGS), aValue.to);
                                }
                            }
                            catch (aError) {
                                FormatTranslator.exitWithError((FormatTranslator.MESSAGE_ERROR_CUSTOM_FAIL + " ") + aError);
                            }
                        });
                    }
                    this.queue(originalText);
                    aOnWrite && aOnWrite(originalText);
                }
                function endAction() {
                    //console.info('Conversion complete for: ', aSource)
                    aOnEnd && aOnEnd();
                }
                return through(writeAction, endAction);
            };
            FormatTranslator.prototype.attemptModuleInclusion = function () {
                var customConversions = this.customConversions;
                if (customConversions) {
                    customConversions.forEach(function (aConversion) {
                        var modulePath = aConversion.module;
                        if (modulePath) {
                            try {
                                aConversion.moduleFunc = require(path.resolve(modulePath));
                            }
                            catch (aErr) {
                                FormatTranslator.exitWithError(aErr);
                            }
                        }
                    });
                }
            };
            FormatTranslator.CONVERSION_MAP = {
                layouts: { from: /{{<(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% extends "$1.html" %} $2' },
                blocks: { from: /{{\$(\w+)}}((.|\n)*?){{\/\1}}/gm, to: '{% block $1 %}$2{% endblock %}' },
                includes: { from: /{{>(.*?)}}/gm, to: '{% include "$1.html" %}' },
                ifTrue: { from: /{{#(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% if $1 %}$2{% endif %}' },
                ifFalse: { from: /{{\^(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% if not $1 %}$2{% endif %}' }
            };
            FormatTranslator.DEFAULT_FLAGS = "gm";
            FormatTranslator.MESSAGE_ERROR_CUSTOM_FAIL = "Custom translations failed:";
            return FormatTranslator;
        }());
        m2n.FormatTranslator = FormatTranslator;
    })(m2n || (m2n = {}));
    return m2n;
});
