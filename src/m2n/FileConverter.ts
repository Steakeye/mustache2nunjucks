/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as fs from 'fs';
import * as through from 'through';

module m2n {

    export class FileConverter {
        constructor(aSource: string, aTarget: string) {
            this.setSourceAndTarget(aSource, aTarget)
        }

        public setSourceAndTarget(aSource: string, aTarget: string): void {
            this.source = aSource;
            this.target = aTarget;
        }

        public convert(): void {
            let inStream: fs.ReadStream = fs.createReadStream(this.source),
            outStream: fs.WriteStream = fs.createWriteStream(this.target),
            transformStream = this.createTransformStream();

            inStream.pipe(transformStream).pipe(outStream);
        }

        private createTransformStream(): through.ThroughStream {
            function writeAction(aBuffer) {
                this.queue((aBuffer + '').replace(/'/g, '\\\'').replace(/\r\n|\r|\n/g, '\\n'));
            }
            function endAction() {
                this.queue('\';');
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