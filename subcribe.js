export class Subscribtion {
    #id; // id
    #resolve = undefined;
    #reject = undefined;
    #closed;
    constructor (id) {
        this.#id = id;
        this.#closed = false;
    }
    hasId (id) {
        return this.#id === id
    }
    waitNext () {
        if (this.#closed) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }
    feedNext (value) {
        if (this.#resolve) {
            this.#resolve(value);
            this.#resolve = undefined;
            this.#reject = undefined;
        }
    }
    close () {
        if (this.#reject) {
            this.#reject();
            this.#resolve = undefined;
            this.#reject = undefined;
        }
        this.#closed = true;
    }
}

const subs = new Map();

export const createSubscribe = (id) => {
    deleteSubscribe(id);
    const sub = new Subscribtion(id);
    subs.set(id, sub);
    return sub;
};

export const feedSubscribe = (id, value) => {
    if (subs.has(id)) {
        subs.get(id).feedNext(value);
    }
};

export const deleteSubscribe = (id) => {
    if (subs.has(id)) {
        const sub = subs.get(id);
        sub.close();
        subs.delete(id);
    }
};
