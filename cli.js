const build = require("./build_out/build/main");

const args = process.argv;

const command = args[2];
if(!command) {
    throw new Error("Missing command");
}

const action = build[command];
if(!action) {
    throw new Error("Command " + command + " was not found");
}

action();
