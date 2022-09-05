const sleep = ms => new Promise(r => setTimeout(r, ms));

export class Panel {
    #id; // id
    #resolve = undefined;
    #reject = undefined;
    #closed;
    constructor (id, content = {}) {
        this.#id = id;
        this.#closed = false;
        this.content = content;
    }
    hasId (id) {
        return this.#id === id;
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

const panelsMap = new Map();

export const hasPanel = (id) => {
    if (panelsMap.has(id)) return true;
    return false;
};

export const getPanelContent = (id) => {
    if (panelsMap.has(id)) {
        return panelsMap.get(id).content;
    }
    return undefined;
};

export const createPanel = (id, content) => {
    const sub = new Panel(id, content);
    panelsMap.set(id, sub);
    return sub;
};

export const feedPanel = (id, content) => {
    if (panelsMap.has(id)) {
        panelsMap.get(id).feedNext(content);
    }
};

export const deletePanel = (id) => {
    if (panelsMap.has(id)) {
        const sub = panelsMap.get(id);
        sub.close();
        panelsMap.delete(id);
    }
};
