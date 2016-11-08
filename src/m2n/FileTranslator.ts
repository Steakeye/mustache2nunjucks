/// <reference path="../../typings/index.d.ts" />
/**
 * Created by steakeye on 19/10/16.
 */

import {ThroughStream} from 'through';

module m2n {
    export interface FileTranslator {
        createTranslationStream(aOnWrite?: (aTranslated: string) => void, aOnEnd?: () => void): ThroughStream
    }
}

export = m2n;
