"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const process = require("process");
const VHDLFormatter_1 = require("./VHDLFormatter");
;
function beautify(input, settings) {
    try {
        const data = VHDLFormatter_1.beautify(input, settings);
        return {
            err: null,
            data
        };
    }
    catch (err) {
        return {
            err,
            data: null
        };
    }
}
function main(filename, write) {
    fs.readFile(filename, (err, data) => {
        if (err != null) {
            console.error("error: could not read filename \"" + filename + "\"");
            console.error(err);
            process.exit(-1);
            return;
        }
        const input_vhdl = data.toString('utf8');
        const settings = new VHDLFormatter_1.BeautifierSettings(false, // removeComments
        false, // removeReports
        false, // checkAlias
        null, // signAlignSettings
        "uppercase", // keyWordCase
        "uppercase", // typeCase
        "\t", // indentation
        null, // newline settings
        "\r\n" // end of line
        );
        const result = beautify(input_vhdl, settings);
        if (result.err !== null) {
            console.error(`error: could not beautify "${filename}"`);
            console.error(err);
            process.exit(-1);
            return;
        }
        const output_vhdl = result.data;
        // fs.writeFile(filename, output_vhdl, (err, data))
        if (write) {
            const data = new Uint8Array(Buffer.from(output_vhdl));
            fs.writeFile(filename, data, (err) => {
                if (err) {
                    console.error(`error: could not save "${filename}"`);
                    console.error(err);
                    process.exit(-1);
                    return;
                }
                console.log(`info: saved file "${filename}"`);
                process.exit(0);
            });
        }
        else {
            console.log(output_vhdl);
            process.exit(0);
        }
    });
}
(() => {
    if (process.argv.length !== 3) {
        console.error("usage: node beautify.js <filename>");
        process.exit(-1);
        return;
    }
    const filename = process.argv[2];
    const write = true;
    main(filename, write);
})();
//# sourceMappingURL=vhdlformat.js.map