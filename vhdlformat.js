"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const process = require("process");
const minimist = require("minimist");
const VHDLFormatter_1 = require("./VHDLFormatter");
;
function beautify(input, settings) {
    try {
        const data = VHDLFormatter_1.beautify(input, settings);
        return {
            data,
            err: null,
        };
    }
    catch (err) {
        return {
            data: null,
            err,
        };
    }
}
function main(options) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(options.inputFile)) {
            console.error(`-- [ERROR]: could not read filename "${options.inputFile}"`);
            reject(new Error("Could not find file"));
            return;
        }
        fs.readFile(options.inputFile, (err, data) => {
            if (err != null || ((typeof data) === "undefined")) {
                console.error(`-- [ERROR]: could not read filename "${options.inputFile}"`);
                reject(err);
            }
            const input_vhdl = data.toString('utf8');
            const settings = new VHDLFormatter_1.BeautifierSettings(options.removeComments, options.removeReports, options.checkAlias, options.signAlignSettings, options.keyWordCase, options.typeCase, options.indentation, null, options.endOfLine);
            const result = beautify(input_vhdl, settings);
            if (result.err !== null) {
                console.error(`-- [ERROR]: could not beautify "${options.input}"`);
                reject(err);
            }
            const output_vhdl = result.data;
            if (!options.quiet) {
                console.log(output_vhdl);
            }
            if (options.overwrite) {
                const data = new Uint8Array(Buffer.from(output_vhdl));
                fs.writeFile(options.input, data, (err) => {
                    if (err) {
                        console.error(`-- [ERROR]: could not save "${options.input}"`);
                        reject(err);
                    }
                    else {
                        console.log(`-- [INFO]: saved file "${options.input}"`);
                        resolve();
                    }
                });
            }
            else {
                console.error(`-- [INFO]: read file "${options.input}"`);
                resolve();
            }
        });
    });
}
function print_usage() {
    console.error(`-- USAGE: node vhdlformat.js [--write] [--debug] [--quiet] <filename 1> [filename 2] ... [filename N]`);
}
(() => {
    const options = {
        string: ['key-word-case', 'type-case', 'indentation', 'end-of-line', 'inputFiles'],
        boolean: ['version', 'help', 'overwrite', 'debug', 'quiet', 'version', 'help',
            'remove-comments', 'remove-reports', 'check-alias'],
        alias: {
            v: 'version',
            h: 'help',
            removeComments: 'remove-comments',
            removeReports: 'remove-reports',
            checkAlias: 'check-alias',
            keyWordCase: 'key-word-case',
            typeCase: 'type-case',
            endOfLine: 'end-of-line',
        },
        default: {
            'version': false,
            'help': false,
            'remove-comments': false,
            'remove-reports': false,
            'check-alias': false,
            // sign-align-settings : null,        
            'key-word-case': "uppercase",
            'type-case': "uppercase",
            'indentation': "\t",
            'end-of-line': "\r\n"
        }
    };
    let args = minimist(process.argv.slice(2), options);
    args.inputFiles = args._;
    console.log('args:', args);
    if (process.argv.length < 3) {
        print_usage();
        process.exit(-1);
        return;
    }
    if (args.inputFiles.length < 1) {
        print_usage();
        console.error("-- [ERROR]: must specify at least one input filename");
        process.exit(-1);
        return;
    }
    args.inputFiles.forEach((input) => {
        args.inputFile = input;
        main(args).catch((err) => {
            if (args.verbose) {
                console.error(err);
            }
        });
    });
})();
//# sourceMappingURL=vhdlformat.js.map