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
        define(["require", "exports", 'through'], factory);
    }
})(function (require, exports) {
    "use strict";
    var through = require('through');
    var m2n;
    (function (m2n) {
        var FormatTranslator = (function () {
            function FormatTranslator() {
            }
            FormatTranslator.prototype.createTranslationStream = function (aOnWrite, aOnEnd) {
                function writeAction(aBuffer) {
                    var conversion, conversionMap = FormatTranslator.CONVERSION_MAP, convertedText = aBuffer.toString();
                    for (conversion in conversionMap) {
                        var conversionPair = conversionMap[conversion];
                        //console.log('conversion: ', conversion)
                        //TODO: Do this in a loop so we have a multipass over the text
                        convertedText = convertedText.replace(conversionPair.from, conversionPair.to);
                    }
                    this.queue(convertedText);
                    aOnWrite && aOnWrite(convertedText);
                }
                function endAction() {
                    //console.info('Conversion complete for: ', aSource)
                    aOnEnd && aOnEnd();
                }
                return through(writeAction, endAction);
            };
            FormatTranslator.CONVERSION_MAP = {
                layouts: { from: /{{<(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% extends "$1.html" %} $2' },
                blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
                includes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
                ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
                ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
            };
            return FormatTranslator;
        }());
        m2n.FormatTranslator = FormatTranslator;
    })(m2n || (m2n = {}));
    return m2n.FormatTranslator;
});
