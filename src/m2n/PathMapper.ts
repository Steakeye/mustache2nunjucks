/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import * as glob from 'glob';

module m2n {
    export interface MappingPair {
        from: string;
        to: string;
    }

    export class PathMapper {

        private static ERROR_MESSAGES: {
            error: string;
        } = {
            error: "error"
        };

        private static exitWithError(aError: string | Error): void {
            console.error(aError)
            process.exit(1);
        }

        constructor(aSource: string, aTarget: string) {
            this.setSourceAndTarget(aSource, aTarget)
        }

        public setSourceAndTarget(aSource: string, aTarget: string, aGlobPattern: string = "**/*.*"): void {
            this.source = aSource;
            this.target = aTarget;
            this.pattern = aGlobPattern;
        }

        public generatePaths(): MappingPair[] {
            console.info('Generating paths for: ', this.source, ' to ', this.target)

            let files: string[] = glob.sync(this.pattern, { cwd: this.source }),
                mappedFiles: MappingPair[] = files.map((aFilePath: string) => {
                    let fileFragment = '/' + aFilePath;

                    return {
                        from: this.source + fileFragment,
                        to: this.target + fileFragment
                    };
                });

            return mappedFiles;
        }

        private source: string;
        private target: string;
        private pattern: string;

    }
}

export = m2n;