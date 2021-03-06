#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />
/// <reference path="m2n/PathMapper.ts" />

/**
 * Created by steakeye on 06/10/16.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as cliArgs from 'commander';
import FileConverter from './m2n/FileConverter';
import {FormatTranslator, ExternalConversion} from './m2n/FormatTranslator';
import {PathMapper, MappingPair} from './m2n/PathMapper';

enum OutputType {
    FILE,
    FOLDER
}

interface PathResolution {
    path: string;
    valid: boolean;
}

interface Config {
    customTranslations: ExternalConversion[];
}

class M2NService {
    public static DEFAULT_CONFIG_PATH: string  = process.cwd() + '/m2nconfig.json';

    private static SOURCE_PATH_NOT_FOUND: string  = "Source path not found";
    private static CONFIG_PATH_NOT_FOUND: string  = "Config path not found";
    private static CONVERSION_COMPLETE: string  = "\nConversions completed!";

    constructor(sourcePath: string, outputPath?: string, configPath?: string) {
        // console.log("M2NService");
        // console.log(arguments);

        if (!outputPath) { //undefined or empty string
            this.assignSourceToBothPaths(sourcePath)
        } else {
            this.assignPathValues(sourcePath, outputPath);
        }
        this.setOutputType();

        this.tryToLoadConfig(configPath);
    }

    public convertFiles(): void {
        let fileConverter: FileConverter,
            pathMapper: PathMapper,
            fileMappings: MappingPair[],
            customTranslations = this.customConfig ? this.customConfig.customTranslations: undefined,
            conversionJobs: FileConverter[] = [];

        const onConversion = (aError: any, aFileConversion: FileConverter) => {
            let jobListIdx:number;

            if (aError) {
                this.exitWithError(aError)
            } else {
                jobListIdx = conversionJobs.lastIndexOf(aFileConversion);

                if (jobListIdx !== -1) { //Remove job from list

                    conversionJobs.splice(jobListIdx, 1);

                    if (!conversionJobs.length) { //If all jobs completed
                        console.log(M2NService.CONVERSION_COMPLETE);
                        process.exit(0);
                    }
                }
            }
        };

        function convert(aFrom: string, aTo: string) {
            conversionJobs.push(fileConverter = new FileConverter(aFrom, aTo, new FormatTranslator(customTranslations)));
            fileConverter.convert(onConversion);
        }

        if (this.outputType === OutputType.FILE) {
            //Just use the file converter on one source
            convert(this.sourcePath, this.outputPath);
        } else {
            //Assume is directory
            //Get all the files in the directory
            pathMapper = new PathMapper(this.sourcePath, this.outputPath);
            //Create mappings to desitnations
            fileMappings = pathMapper.generatePaths();
            //Iterate over list of files, converting one by one
            fileMappings.forEach((aMapping: MappingPair) => {
                convert(aMapping.from, aMapping.to);
            });
        }
    }

    private sourcePath:string;
    private outputPath:string;
    private outputType:OutputType;
    private customConfig: Config;

    private tryToLoadConfig(aConfigPath: string): void {
        let resolvedPath: PathResolution = this.resolveAndValidatePath(aConfigPath);/*,
            configJson:Config;*/

        if (resolvedPath.valid) {
            try {
                this.customConfig = require(resolvedPath.path);
            } catch (aErr) {
                this.exitWithError(aErr);
            }
        } else if (resolvedPath.path !== M2NService.DEFAULT_CONFIG_PATH) {
            this.exitWithError(M2NService.CONFIG_PATH_NOT_FOUND);
        }
    }

    private resolveAndValidatePath(aPathToResolve: string): PathResolution {
        let resolvedSource: string = path.resolve(aPathToResolve);

        return {
            path: resolvedSource,
            valid: fs.existsSync(resolvedSource)
        };
    }

    private resolveAndAssignSource(aPath: string): string {
        return (this.sourcePath = this.resolveAndValidateSourcePath(aPath));
    }

    private assignSourceToBothPaths(aPath: string) : void {
        this.outputPath = this.resolveAndAssignSource(aPath);
    }

    private assignPathValues(aSourcePath: string, aTargetPath: string): void {
        this.resolveAndAssignSource(aSourcePath);
        this.outputPath = path.resolve(aTargetPath);
    }

    private resolveAndValidateSourcePath(aPath: string) : string {
        let resolvedPath: PathResolution = this.resolveAndValidatePath(aPath)

        if (!resolvedPath.valid) {
            this.exitWithError(M2NService.SOURCE_PATH_NOT_FOUND);
        }

        return resolvedPath.path;
    }

    private setOutputType() : void {
        this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE: OutputType.FOLDER;
    }

    private exitWithError(aError: string): void {
        console.error(aError);
        process.exit(1);
    }

}

//Set up the CLI interface then process the arguments in order to get the data/instructions
cliArgs.version('0.0.1')
    .option('-S, --source [path]', 'Directory or file to convert', process.cwd())
    .option('-O, --output [path]', 'Location to save converted file(s)')
    .option('-C, --config [path]', 'Location of json config file to load. Defaults to m2nconfig.json in root', M2NService.DEFAULT_CONFIG_PATH)
    .parse(process.argv);

let m2nService:M2NService = new M2NService((<any>cliArgs).source, (<any>cliArgs).output, (<any>cliArgs).config);

m2nService.convertFiles();
