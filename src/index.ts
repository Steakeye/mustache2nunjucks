#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

/**
 * Created by steakeye on 06/10/16.
 */
const fs = require('fs');
const path = require('path');

import through = require('through');
import cliArgs = require('commander');
import FileConverter = require('./m2n/FileConverter');

function processOptions(aOptions: commander.IExportedCommand) {
    console.log('processOptions: ', aOptions)
}

enum OutputType {
    FILE,
    FOLDER
}

class M2NService {
    private static PATH_NOT_FOUND: string  = "Source path not found";

    constructor(sourcePath: string = process.cwd(), outputPath?: string) {
        console.log("M2NService");
        console.log(arguments);

        if (!outputPath) { //undefined or empty string
            this.assignSourceToBothPaths(sourcePath)
        } else {
            this.assignPathValues(sourcePath, outputPath);
        }
        this.setOutputType();

    }

    public convertFiles(): void {
        let fileConverter: FileConverter;

        if (this.outputType === OutputType.FILE) {
            //Just use the file converter on one source
            fileConverter = new FileConverter(this.sourcePath, this.outputPath)
            fileConverter.convert();
        } else {
            //Assume is directory
            //Get all the files in the direcgory
            //Create mappings to desitnations
            //Iterate over list of files, converting one by one

        }
    }

    private sourcePath:string;
    private outputPath:string;
    private outputType:OutputType


    private resolveAndAssignSource(aPath: string): string {
        let resolvedSource: string = path.resolve(aPath);

        this.validatePath(resolvedSource);

        return (this.sourcePath = resolvedSource);
    }

    private assignSourceToBothPaths(aPath: string) : void {
        this.outputPath = this.resolveAndAssignSource(aPath);
    }

    private assignPathValues(aSourcePath: string, aTargetPath: string): void {
        this.resolveAndAssignSource(aSourcePath);
        this.outputPath = path.resolve(aTargetPath);
    }

    private validatePath(aPath: string) : void {
        let pathExists: boolean = fs.existsSync(aPath);

        if(!pathExists) {
            this.exitWithError(M2NService.PATH_NOT_FOUND);
        }
    }

    private setOutputType() : void {
        this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE: OutputType.FOLDER;
    }

    private exitWithError(aError: string): void {
        console.error(aError)
        process.exit(1);
    }

}



//Set up the CLI interface then process the arguments in order to get the data/instructions
cliArgs.version('0.0.1')
    .option('-s, --source [path]', 'Directory or file to convert', process.cwd())
    .option('-o, --output [path]', 'Location to save converted file(s)')
    .parse(process.argv);

function ConvertFiles() {
    let m2nService = new M2NService((<any>cliArgs).source, (<any>cliArgs).output);

    m2nService.convertFiles();
}

ConvertFiles();