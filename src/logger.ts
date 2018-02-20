
export interface ILogger {
    log(...args);
    error(...args);
    warn(...args);
}

export class NullLogger implements ILogger {
    log(...args) {
    }

    error(...args) {
    }

    warn(...args) {
    }
}

export let logger = new NullLogger();

export function enableLogging() {
    logger = {
        log: console.log.bind(console, "[bu]"),
        error: console.error.bind(console, "[bu]"),
        warn: console.warn.bind(console, "[bu]"),
    }
}
