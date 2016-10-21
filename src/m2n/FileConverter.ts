/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as fs from 'fs';
import * as through from 'through';

module m2n {
    interface ConversionPair {
        from: RegExp;
        to: string;
    }

    interface ConversionMap { [  conversion_name: string ]: ConversionPair }

    export class FileConverter {
        private static CONVERSION_MAP: ConversionMap = {
            layouts: { from: /{{<layouts(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% extends "$1.html" %} $2' },
            blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/(\w+)}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
            incliudes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
            ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
            ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
        };

        constructor(aSource: string, aTarget: string) {
            this.setSourceAndTarget(aSource, aTarget)
        }

        public setSourceAndTarget(aSource: string, aTarget: string): void {
            this.source = aSource;
            this.target = aTarget;
        }

        public convert(): void {
            console.info('Converting: ', this.source)
            let inStream: fs.ReadStream = fs.createReadStream(this.source),
            //outStream: fs.WriteStream = fs.createWriteStream(this.target),
            transformStream = this.createTransformStream();

            //inStream.pipe(transformStream).pipe(outStream);
            inStream.pipe(transformStream);
        }

        private createTransformStream(): through.ThroughStream {
            let converter: FileConverter = this;

            function writeAction(aBuffer) {
                let conversion: any,
                    conversionMap: ConversionMap = FileConverter.CONVERSION_MAP,
                    convertedText: string = aBuffer.toString();

                for (conversion in conversionMap) {
                    let conversionPair: ConversionPair = conversionMap[conversion];

                    console.log('conversion: ', conversion)
                    convertedText = convertedText.replace(conversionPair.from, conversionPair.to)
                }

                this.queue(convertedText);
            }
            function endAction() {
                console.info('Conversion complete for: ', converter.source)
            }

            return through(writeAction, endAction);
        }

        private source: string;
        private target: string;

    }
}

export = m2n.FileConverter;

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