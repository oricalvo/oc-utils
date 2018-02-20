import {createDirectory, deleteDirectory, ensureDirectory, getStat} from "./fs";
import * as path from "path";
import * as fs from "fs";

function async(fn) {
    return function(done) {
        const retVal = fn();
        if(retVal && retVal.then) {
            retVal.then(done);

            retVal.catch(err => {
                console.log(err.message);
                expect(false).toBeTruthy();

                done();
            });
        }
    }
}

describe("deleteDirectory", function() {
    it("doesn't throw exception when directory does not exist", async(async ()=> {
        try {
            await deleteDirectory("1");
        }
        catch(err) {
            expect(false).toBeTruthy();
        }
    }));

    it("doesn't throw exception when nested directory does not exist", async(async ()=> {
        try {
            await deleteDirectory("1/2/3");
        }
        catch(err) {
            expect(false).toBeTruthy();
        }
    }));
});

describe("createDirectory", function() {
    it("it throws an exception when directory already exists", async(async ()=> {
        try {
            const p = path.join(__dirname, "1/2");
            console.log(p);
            await createDirectory(p);
        }
        catch(err) {
            expect(true).toBeTruthy();
        }
    }));

    it("creates a directory", async(async ()=> {
        await deleteDirectory("1");
        await createDirectory("1");
        const stats = await getStat("1");
        if(!stats.isDirectory()) {
            expect(false).toBeTruthy();
        }
    }));

    it("doesn't create a nested directory", async(async ()=> {
        try {
            await deleteDirectory("1/2");
            await deleteDirectory("1");
            await createDirectory("1/2");
            expect(false).toBeTruthy();
        }
        catch(err) {
            expect(true).toBeTruthy();
        }
    }));
});

describe("ensureDirectory", function() {
    it("creates a nested directory", async(async ()=> {
        await deleteDirectory("1/2");
        await deleteDirectory("1");
        await ensureDirectory("1/2");
        const stats = await getStat("1/2");
        expect(stats.isDirectory()).toBeTruthy();
    }));

    it("it does not throw an exception when directory already exists", async(async ()=> {
        await deleteDirectory("1/2");
        await deleteDirectory("1");
        await createDirectory("1");
        await createDirectory("1/2");
        await ensureDirectory("1/2");
    }));
});
