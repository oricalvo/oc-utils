export function delay(ms): Promise<void> {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, ms);
    }) as any;
}

export class PromiseBuilder {
    static fromNodeStream(stream): PromiseBuilderOnStream {
        return new PromiseBuilderOnStream(stream);
    }
}

export class PromiseBuilderOnStream {
    private end;
    private begin;

    constructor(stream) {
        this.end = this.begin = stream;
    }

    pipe(pipe) {
        this.end = this.end.pipe(pipe);

        return this;
    }

    build() {
        var me = this;

        return new Promise(function (resolve, reject) {
            //
            //  Must read the stream completely (flowing mode), else, no end event will occur
            //
            me.end.resume();

            me.end.on('end', function () {
                resolve();
            });

            me.end.on('error', function (err) {
                me.begin.end();

                reject(err);
            });
        });
    }
}

export function promisifyNodeFn1(func) {
    return function(arg) {
        return new Promise((resolve, reject)=> {
            func(arg, function(err, res) {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(res);
            });
        });
    }
}

export function promisifyNodeFn2(func) {
    return function(arg1, arg2) {
        return new Promise((resolve, reject)=> {
            func(arg1, arg2, function(err, res) {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(res);
            });
        });
    }
}
