import {copyGlob, copyFile, deleteDirectory} from "../src/fs";
import {spawn} from "../src/process";
import * as path from "path";
import {logger, enableLogging} from "../src/logger";

enableLogging();

const folders = {
    package: path.join(__dirname, "../package"),
}

logger.log(folders.package);

export async function pack() {
    logger.log("Deleting temp directories");
    await deleteDirectory("./src_out");
    await deleteDirectory("./dist");
    await deleteDirectory("./package");

    logger.log("Compiling typescript");
    await spawn(path.resolve("node_modules/.bin/tsc"), ["-p", "./tsconfig.json"], {
        shell: true,
        validateExitCode: true,
    });

    logger.log("Bundling using Rollup");
    await spawn(path.resolve("node_modules/.bin/rollup"), ["-c", "./build/rollup.config.js"], {
        shell: true,
        validateExitCode: true,
    });

    logger.log("Copying files to package directory");
    await copyFile("./dist/bundle.js", "./package/oc-utils.js");
    await copyGlob("./src_out/*.d.ts", "./package");
    await copyGlob("./bin/*.js", "./package/bin");
    await copyFile("./package.json", "package/package.json");
}

export async function patch() {
    await pack();

    await spawn("npm", ["version", "patch"], {
        cwd: "./package",
    });

    await copyFile("readme.md", "package/readme.md");

    await spawn("npm", ["publish"], {
        cwd: "./package",
    });

    await copyFile("package/package.json", "./package.json");
}

export async function link() {
    await spawn("npm", ["link"], {
        cwd: "./package"
    });
}
