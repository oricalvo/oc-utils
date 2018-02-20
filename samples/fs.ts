import * as fs from "fs";
import * as fsExtra from "fs-extra/lib";
import * as glob from "glob";
import * as Bluebird from "bluebird";
import * as bufs from "build-utils/fs";
import * as path from "path";

export const searchGlob: (pattern: string)=>Promise<string[]> = Bluebird.promisify(glob);
Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(fsExtra);

run();

async function run() {
    try {
        console.log(__dirname);

        const filePath = path.normalize("./1.txt");
        const destPath = "./dest";

        //console.log(filePath);
        //console.log(destPath);

        const res = await searchGlob("1.txt");
        for(const r of res) {
            console.log(r);
        }
    }
    catch(err) {
        console.log("ERROR: " + err.message);
    }
}


function getGlobBase(pattern) {
    let base = "";
    const parts = pattern.split("/");
    let hasMagic = false;

    for(let part of parts) {
        if(!glob.hasMagic(part)) {
            if(base != "") {
                base += "/";
            }

            base += part;
        }
        else {
            hasMagic = true;
            break;
        }
    }

    if(!hasMagic) {
        return "";
    }

    return base;
}

export async function copyGlob(pattern, dest) {
    const base = getGlobBase(pattern);
    const files = await searchGlob(pattern);
    return copyFiles(files, base, dest);
}

export function copyFiles(files, base, dest) {
    return Promise.all(files.map(file => {
        const relativeName = file.substring(base.length);
        return copyFile(file, path.posix.join(dest, relativeName), true)
    }));
}

export function copyFile(from, to, ignoreDir = false) {
    return Promise.resolve().then(()=> {
        return fs["statAsync"](from).then(stat => {
            if (stat.isDirectory()) {
                if (!ignoreDir) {
                    throw new Error("Specified path is a directory");
                }
            }
            else {
                return fsExtra["copyAsync"](from, to);
            }
        });
    });
}
