import * as fs from "fs";
import * as fsExtra from "fs-extra/lib";
import * as glob from "glob";
import * as path from "path";
import * as minimatch from "minimatch";
import {promisifyNodeFn1, promisifyNodeFn2} from "./promise";
import {Stats} from "fs";

const fsExtraRemove = promisifyNodeFn1(fsExtra.remove);
const fsExtraCopy = promisifyNodeFn2(fsExtra.copy);

export const createDirectory = promisifyNodeFn1(fs.mkdir);
export const ensureDirectory = promisifyNodeFn1(fsExtra.ensureDir);

export function getStat(path): Promise<Stats> {
    return new Promise((resolve, reject)=> {
        fs.stat(path, function(err, stat) {
            if(err) {
                reject(err);
                return;
            }

            resolve(stat);
        });
    });
}

export function directoryExists(dir) {
    return isDirectory(dir);
}

export function fileExists(path) {
    return isFile(path);
}

export async function isFile(path): Promise<boolean> {
    try {
        const stat = await getStat(path);
        return stat.isFile();
    }
    catch(err) {
        if(err.code == "ENOENT") {
            return false;
        }

        throw err;
    }
}

export async function isDirectory(path): Promise<boolean> {
    try {
        const stat = await getStat(path);
        return stat.isDirectory();
    }
    catch(err) {
        if(err.code == "ENOENT") {
            return false;
        }

        throw err;
    }
}

export async function deleteDirectory(path) {
    try {
        const isDir = await isDirectory(path);
        if (!isDir) {
            return;
        }

        await fsExtraRemove(path);
    }
    catch(err) {
        if(err.code == "ENOENT") {
            return;
        }

        throw err;
    }
}

function getGlobBase(pattern) {
    let base = "";
    let hasMagic = false;
    const parts = pattern.split("/");
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
        return null;
    }

    return base;
}

export async function copyGlob(pattern, dest) {
    const base = getGlobBase(pattern);
    const files = await searchGlob(pattern);
    return copyFiles(files, base, dest);
}

export function deleteGlob(pattern) {
    const g = glob; // to prevent rollup error

    return new Promise(function(resolve, reject) {
        g(pattern, {}, function (er, files) {
            Promise.all(files.map(file => {
                deleteFile(file);
            })).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    });
}

export async function copyFile(from, to, ignoreDir = false) {
    const stats = await getStat(from);
    if (stats.isDirectory()) {
        if (!ignoreDir) {
            throw new Error("Specified path is a directory");
        }
    }

    await fsExtraCopy(from, to);
}

export function copyFiles(files, base, dest) {
    return Promise.all(files.map(file => {
        const relativeName = file.substring(base.length);
        return copyFile(file, path.posix.join(dest, relativeName), true)
    }));
}

export async function deleteFile(path) {
    try {
        const isDir = await isFile(path);
        if (!isDir) {
            throw new Error("Specified path \"" + path + "\" is not a file");
        }

        await fsExtraRemove(path);
    }
    catch(err) {
        if(err.code == "ENOENT") {
            return;
        }

        throw err;
    }
}

export function readFile(path, enc) {
    return fs["readFileAsync"](path, enc).then(res => {
        return res;
    });
}

export function writeFile(path, data, enc) {
    return fs["writeFileAsync"](path, data, enc);
}

export async function readJSONFile(path) {
    const text = await readFile(path, "utf8");
    const obj = JSON.parse(text);
    return obj;
}

export async function writeJSONFile(path, obj, ident?) {
    const text = JSON.stringify(obj, null, ident);
    await writeFile(path, text, "utf8");
}

export const searchGlob: (pattern: string)=>Promise<string[]> = promisifyNodeFn1(glob);

export function excludeFiles(files, pattern) {
    const m = minimatch; // to prevent rollup error

    return files.filter(file => {
        return !m(file, pattern);
    });
}

export function appendFile(path: string, text: string) {
    return fs["appendFileAsync"](path, text);
}

export function replaceExt(filePath: string, ext: string) {
    const info  = path.parse(filePath);
    const res = path.join(info.dir, info.name + "." + ext);
    return res;
}
