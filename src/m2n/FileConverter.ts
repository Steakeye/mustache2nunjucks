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
            //TODO: fix this? What do we need to know?
            layouts: { from: /{{<layouts(.*)}}((.|\n)*){{\/(.*)}}/gm, to: '{% extends "$1.html" %} $2' },
            blocks: { from: /{{\$(\w+)}}((.|\n)*){{\/\1}}/gm, to: '{% block $1 %} \r $2 \r {% endblock %}' },
            includes: { from: /{{>(.*)}}/gm, to: '{% include "$1.html" %}' },
            ifTrue: { from: /{{#(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if $1 %} \r $2 \r {% endif %}' },
            ifFalse: { from: /{{\^(.*)}}((.|\n)*){{\/\1}}/gm, to: '{% if not $1 %} \r $2 \r {% endif %}' }
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

            if (this.isTargetSameAsSource()) {
                this.convertToSource();
            } else {
                this.convertToTarget();
            }

        }

        private isTargetSameAsSource(): boolean {
            return this.source == this.target
        }

        private convertToSource() : void {
            let inStream: fs.ReadStream = fs.createReadStream(this.source, { flags: 'r+', autoClose: false }/*{ autoClose: false, flags: 'r+' }*/),
                outStream: fs.WriteStream, // = fs.createWriteStream(this.target, ),
                //transformStream: through.ThroughStream = this.createTransformStream();
                transformStream: through.ThroughStream = inStream.pipe(this.createTransformStream());

            //inStream.pipe(transformStream).pipe(outStream);
            inStream.on('open', (aFileDescriptor: number) => {
                outStream = this.createOutputStream(aFileDescriptor);
                //inStream.pipe(transformStream).pipe(outStream);
                transformStream.pipe(outStream);
            });
            inStream.on('data', (aChunk: string) => {
                console.log('onData: ', aChunk);
            });
            inStream.on('end', () => {
                console.log('inStream.onEnd');
            });
        }

        private convertToTarget() : void {
            let inStream: fs.ReadStream = fs.createReadStream(this.source),
                outStream: fs.WriteStream = fs.createWriteStream(this.target),
                transformStream = this.createTransformStream();

            inStream.pipe(transformStream).pipe(outStream);
            //inStream.pipe(transformStream);
        }

        private createOutputStream(aFileDescriptor: number): fs.WriteStream {
            let outStream = fs.createWriteStream(this.target, { fd: aFileDescriptor });

            outStream.on('open', (aDat: any) => {
                console.log('outStream.data');
            });

            outStream.on('data', (aDat: any) => {
                console.log('outStream.data');
            });

            outStream.on('end', () => {
                console.log('outStream.onEnd');
            });

            return outStream;
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