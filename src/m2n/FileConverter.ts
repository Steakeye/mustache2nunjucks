/// <reference path="../../typings/index.d.ts" />
/// <reference path="FileTranslator.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as through from 'through';

import {FileTranslator} from './FileTranslator';

module m2n {
    interface ConversionPair {
        from: RegExp;
        to: string;
    }

    interface ConversionMap { [  conversion_name: string ]: ConversionPair }

    export class FileConverter {

        private static NODE_ERRORS: {
            enoent: number;
        } = {
            enoent: -2
        };

        private static ERROR_MESSAGES: {
            fileToDir: string;
        } = {
            fileToDir: "Cannot convert file to directory"
        };

        private static exitWithError(aError: string | Error): void {
            console.error(aError)
            process.exit(1);
        }

        constructor(aSource: string, aTarget: string, aTranslation: FileTranslator) {
            this.setSourceAndTarget(aSource, aTarget);
            this.setTranslation(aTranslation);
        }

        public setSourceAndTarget(aSource: string, aTarget: string): void {
            this.source = aSource;
            this.target = aTarget;
        }

        public setTranslation(aTranslation: FileTranslator): void {
            this.translation = aTranslation;
        }

        public convert(): void {
            console.info('Converting:', this.source, 'to', this.target)

            if (this.isTargetSameAsSource()) {
                this.convertToSource();
            } else {
                this.convertToTarget();
            }

        }

        private isTargetSameAsSource(): boolean {
            return this.source === this.target
        }

        private convertToSource() : void {
            let inStream: fs.ReadStream = fs.createReadStream(this.source),
                transformStream: through.ThroughStream = this.getTranslationStream(this.onConversionToSource.bind(this), this.onConversionComplete.bind(this));

            this.buffer = [];

            inStream.pipe(transformStream);

            inStream.on('end', () => {
                //console.log('inStream.onEnd');
                let outStream: fs.WriteStream = fs.createWriteStream(this.target);

                outStream.write(this.buffer.join(''), function() {
                    //console.log('outStream.write, what happened?: ', arguments)
                });

                this.buffer.length = 0;
                this.buffer = undefined;
            });
        }

        private convertToTarget() : void {
            this.ensureValidTarget(() => {
                let inStream: fs.ReadStream = fs.createReadStream(this.source),
                    transformStream = this.getTranslationStream(undefined, this.onConversionComplete.bind(this)),
                    outStream: fs.WriteStream = fs.createWriteStream(this.target);

                inStream.pipe(transformStream).pipe(outStream);
            });
        }

        private onConversionToSource(aNewContent: string): void {
            this.buffer.push(aNewContent);

        }

        private onConversionComplete(): void {
            console.info('Conversion complete for: ', this.target)
        }

        private ensureValidTarget(aThen: () => void): void {
            mkdirp(path.parse(this.target).dir, (aError: Error) => {
                if (aError) {
                    FileConverter.exitWithError(aError);
                } else {
                    fs.stat(this.target, (aErr: Error, aStats: fs.Stats) => {
                        let errorMessage: (string | Error);

                        if (aStats && aStats.isDirectory()) {
                            errorMessage = FileConverter.ERROR_MESSAGES.fileToDir;
                        } else if (aErr && (<any>aErr).errno !== FileConverter.NODE_ERRORS.enoent) {
                            errorMessage = aErr;
                        }

                        if (errorMessage === undefined) {
                            aThen();
                        } else {
                            FileConverter.exitWithError(errorMessage);
                        }
                    });
                }
            });
        }

        private getTranslationStream(aOnTranslation?: (aTranslated: string) => void, aOnTranslationComplete?: () => void): through.ThroughStream {
            return this.translation.createTranslationStream(aOnTranslation, aOnTranslationComplete);
        }

        private source: string;
        private target: string;
        private translation: FileTranslator;
        private buffer: string[];

    }
}


export default m2n.FileConverter;
