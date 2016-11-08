/// <reference path="../../typings/index.d.ts" />
/// <reference path="FileTranslator.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as through from 'through';

import {FileTranslator} from './FileTranslator';

module m2n {
    interface ConversionPair {
        from: RegExp;
        to: string;
    }

    interface ConversionMap { [  conversion_name: string ]: ConversionPair }

    export class FormatTranslator implements FileTranslator {
        private static CONVERSION_MAP: ConversionMap = {
            layouts: { from: /{{<(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% extends "$1.html" %} $2' },
            blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
            includes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
            ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
            ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
        };

        public createTranslationStream(aOnWrite?: (aTranslated: string) => void, aOnEnd?: () => void): through.ThroughStream {
            function writeAction(aBuffer) {
                let conversion: any,
                    conversionMap: ConversionMap = FormatTranslator.CONVERSION_MAP,
                    convertedText: string = aBuffer.toString();

                for (conversion in conversionMap) {
                    let conversionPair: ConversionPair = conversionMap[conversion];

                    //console.log('conversion: ', conversion)
                    //TODO: Do this in a loop so we have a multipass over the text
                    convertedText = convertedText.replace(conversionPair.from, conversionPair.to)
                }

                this.queue(convertedText);
                aOnWrite && aOnWrite(convertedText)
            }
            function endAction() {
                //console.info('Conversion complete for: ', aSource)
                aOnEnd && aOnEnd()
            }

            return through(writeAction, endAction);
        }

    }
}

export = m2n.FormatTranslator;
