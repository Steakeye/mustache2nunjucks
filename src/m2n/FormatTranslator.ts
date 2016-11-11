/// <reference path="../../typings/index.d.ts" />
/// <reference path="FileTranslator.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as path from 'path';
import * as through from 'through';

import {FileTranslator} from './FileTranslator';

module m2n {
    export interface ExternalConversion {
        module?: string;
        moduleFunc?: (aString: string) => string;
        func?: string[];
        regExp?: string;
        to?: string;
    }

    interface ConversionPair {
        from: RegExp;
        to: string;
    }

    interface ConversionMap { [  conversion_name: string ]: ConversionPair }

    export class FormatTranslator implements FileTranslator {
        private static CONVERSION_MAP: ConversionMap = {
            layouts: { from: /{{<(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% extends "$1.html" %} $2' },
            blocks: { from: /{{\$(\w+)}}((.|\n)*?){{\/\1}}/gm, to: '{% block $1 %}$2{% endblock %}' },
            includes: { from: /{{>(.*?)}}/gm, to: '{% include "$1.html" %}' },
            ifTrue: { from: /{{#(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% if $1 %}$2{% endif %}' },
            ifFalse: { from: /{{\^(.*)}}((.|\n)*?){{\/\1}}/gm, to: '{% if not $1 %}$2{% endif %}' }
        };

        private static DEFAULT_FLAGS: string = "gm";


        private static exitWithError(aError: string | Error): void {
            console.error(aError)
            process.exit(1);
        }

        constructor(aCustomConversions?: ExternalConversion[]) {
            if (aCustomConversions instanceof Array) {
                this.customConversions = aCustomConversions;
                this.attemptModuleInclusion();
            }
        }

        public createTranslationStream(aOnWrite?: (aTranslated: string) => void, aOnEnd?: () => void): through.ThroughStream {
            let self: FormatTranslator = this;

            function handleRegexReplacement(aOriginal: string, aMatcher: RegExp, aReplacement: string): string {
                let updated: string;

                while (updated !== aOriginal) {
                    updated = aOriginal.replace(aMatcher, aReplacement);

                    if (updated !== aOriginal) {
                        aOriginal = updated;
                        updated = undefined;
                    }
                }

                return updated;
            }

            function writeAction(aBuffer): void {
                let conversion: any,
                    conversionMap: ConversionMap = FormatTranslator.CONVERSION_MAP,
                    originalText: string = aBuffer.toString(),
                    customTranslations: ExternalConversion[] = self.customConversions;

                for (conversion in conversionMap) {
                    let conversionPair: ConversionPair = conversionMap[conversion];

                    originalText = handleRegexReplacement(originalText, conversionPair.from, conversionPair.to);
                }

                if (customTranslations) {
                    customTranslations.forEach((aValue: ExternalConversion) => {
                        let func:(aString: string) => string = aValue.moduleFunc;

                        if (func) {
                            originalText = func(originalText);
                        } else if (aValue.func) {
                            func = Function.apply(undefined, aValue.func);
                            originalText = func(originalText);
                        } else {
                            originalText = handleRegexReplacement(originalText, new RegExp(aValue.regExp, FormatTranslator.DEFAULT_FLAGS), aValue.to);
                        }
                    });
                }

                this.queue(originalText);
                aOnWrite && aOnWrite(originalText)
            }
            function endAction() {
                //console.info('Conversion complete for: ', aSource)
                aOnEnd && aOnEnd()
            }

            return through(writeAction, endAction);
        }

        private customConversions: ExternalConversion[];

        private attemptModuleInclusion(): void {
            let customConversions: ExternalConversion[] = this.customConversions;

            if (customConversions) {
                customConversions.forEach((aConversion: ExternalConversion) => {
                    let modulePath = aConversion.module;

                    if (modulePath) {
                        try {
                            aConversion.moduleFunc = require(path.resolve(modulePath));
                        } catch (aErr) {
                            FormatTranslator.exitWithError(aErr);
                        }
                    }
                });
            }
        }
    }
}

export = m2n;
