import * as shelljs from "shelljs";
import * as child_process from "child_process";
import * as path from "path";
import * as shellOpen from "open";
import * as fs from "./fs";
import {logger} from "./logger";
import {ChildProcess} from "child_process";

//
//  Spwans a new child process without waiting for it
//  On Windows the child process is opened in its own window
//
export function spawn(command, args, overrideOptions?): Promise<ChildProcess> {
    const options: any = {
        stdio: "inherit",
    };

    if (!args) {
        args = [];
    }

    if (overrideOptions) {
        Object.assign(options, overrideOptions);
    }

    return new Promise((resolve, reject) => {
        try {
            logger.log("Spawning a new process");
            logger.log("    " + command);
            logger.log("    " + options);

            const child = child_process.spawn(command, args, options);

            if(options.validateExitCode) {
                child.on("close", function (code) {
                    if (code != 0) {
                        reject(new Error("spawn return error code " + code));
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve(child);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

export function open(document) {
    return new Promise(function(resolve, reject) {
        shellOpen(document);

        resolve();
    });
}

export async function nodemon(filePath): Promise<ChildProcess> {
    if(!await fs.fileExists(filePath)) {
        throw new Error("File does not exist: " + filePath);
    }

    const nodemon = path.join(process.cwd(), "node_modules/.bin/nodemon")
    if(!await fs.fileExists(nodemon)) {
        throw new Error("nodemon was not found at: " + nodemon);
    }

    return spawn("node", ["node_modules/.bin/nodemon", filePath]);
}

export async function runbin(name, args?): Promise<ChildProcess> {
    const relPath = "node_modules/.bin/" + name;
    const fullPath = path.join(process.cwd(), relPath)
    if(!await fs.fileExists(fullPath)) {
        throw new Error("Tool was not found at: " + fullPath);
    }

    return spawn(fullPath, args, {
        shell: true,
    });
}

export async function tsc(tsconfigFilePath): Promise<ChildProcess> {
    if(!await fs.fileExists(tsconfigFilePath)) {
        throw new Error("tsconfig.json was not found at: " + tsconfigFilePath);
    }

    const tsc = path.join(process.cwd(), "node_modules/.bin/tsc")
    if(!await fs.fileExists(tsc)) {
        throw new Error("tsc was not found at: " + tsc);
    }

    return spawn("node_modules/.bin/tsc", ["-p", tsconfigFilePath], {
        shell: true,
    });
}
