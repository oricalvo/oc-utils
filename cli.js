const {pack, patch, link, unlink} = require("./build/main");
const cli = require("./src/cli");
const {enableLogging} = require("./src/logger");

enableLogging();

cli.command("pack", pack);
cli.command("patch", patch);
cli.command("link", link);
cli.command("unlink", unlink);

cli.run();