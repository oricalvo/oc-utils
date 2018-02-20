import {copyGlob, copyFile, deleteDirectory} from "../src/fs";
import {spawn} from "../src/process";
import * as path from "path";
import {logger} from "../src/logger";

const folders = {
    package: path.join(__dirname, "../package"),
}

logger.log(folders.package);

export async function pack() {
    logger.log("Creating npm package");

    await deleteDirectory("./build_tmp");
    await deleteDirectory("./package");

    await spawn(path.resolve("node_modules/.bin/tsc"), ["-p", "./build/tsconfig.pack.json"], {
        shell: true,
        validateExitCode: true,
    });
    await copyGlob("./build_tmp/*.js", "./package");
    await copyGlob("./build_tmp/*.d.ts", "./package");
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
