import * as fs from 'fs';
import * as process from 'process'
import { beautify as _beautify, BeautifierSettings } from "./VHDLFormatter";

interface BeautifyStatus {
  err?: Object;
  data: string;
};

function beautify(input: string, settings: BeautifierSettings): BeautifyStatus {
  try {
    const data = _beautify(input, settings);
    return {
      err: null,
      data
    }
  } catch (err) {
    return {
      err,
      data: null
    }
  }
}

function main(options: CommandOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.input)) {
      console.error(`-- [ERROR]: could not read filename "${options.input}"`);
      reject(new Error("Could not find file"));
      return;
    }

    fs.readFile(options.input, (err, data) => {
      if (err != null || ((typeof data) === "undefined")) {
        console.error(`-- [ERROR]: could not read filename "${options.input}"`);
        reject(err);
      }
      const input_vhdl = data.toString('utf8');

      const settings = new BeautifierSettings(
        false, // removeComments
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
          } else {

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

interface CommandOptions {
  input: string;
  overwrite?: boolean;
  verbose?: boolean;
  quiet?: boolean;
};

function print_usage(): void {
  console.error(`-- USAGE: node vhdlformat.js [--write] [--debug] [--quiet] <filename 1> [filename 2] ... [filename N]`);
}

(() => {

  if (process.argv.length < 3) {
    print_usage();
    process.exit(-1);
    return;
  }

  const filenames = process.argv.filter((arg) => arg.endsWith(".vhd"));

  if (filenames.length < 1) {
    print_usage();
    console.error("-- [ERROR]: must specify at least one input filename")
    process.exit(-1);
    return;
  }

  filenames.forEach((input) => {
    console.log(`-- [INFO]: Reading ${input}...`)
    const overwrite = process.argv.includes('--write');
    const verbose = process.argv.includes("--verbose");
    const quiet = process.argv.includes("--quiet");

    main({
      input,
      overwrite,
      verbose,
      quiet
    }).catch((err) => {
      if (verbose) {
        console.error(err);
      }
    });

  })
})();
