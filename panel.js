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

/** @type {BroadcastChannel | undefined} */
const syncChannel = globalThis.BroadcastChannel ? globalThis.BroadcastChannel("PanelSync") : undefined;
const syncPanelItem = (action, id, content = undefined) => {
    if (!syncChannel) {
        return;
    }
    const msg = {
        action,
        id,
        content,
    };
    syncChannel.postMessage(msg);
};
const initChannel = () => {
    if (syncChannel) {
        syncChannel.addEventListener("message", (event) => {
            const { action, id, content } = event.data;
            if (action === "create") {
                createPanel(id, content);
            } else if (action === "feed") {
                feedPanel(id, content);
            } else if (action === "delete") {
                deletePanel(id);
            } else if (action === "get") {
                if (hasPanel(id)) {
                    syncPanelItem("create", id, getPanelContent(id));
                }
            }
        });
    }
};
initChannel();

export const hasPanel = async (id) => {
    if (panelsMap.has(id)) return true;
    if (!syncChannel) return false;
    syncPanelItem("get", id);
    await sleep(500);
    return panelsMap.has(id);
};

export const getPanelContent = async (id) => {
    if (panelsMap.has(id)) {
        return panelsMap.get(id).content;
    }
    if (!syncChannel) return undefined;
    syncPanelItem("get", id);
    await sleep(500);
    if (panelsMap.has(id)) {
        return panelsMap.get(id).content;
    }
    return undefined;
};

export const createPanel = (id, content) => {
    deletePanel(id);
    const sub = new Panel(id, content);
    panelsMap.set(id, sub);
    syncPanelItem("create", id, content);
    return sub;
};

export const feedPanel = (id, content) => {
    if (panelsMap.has(id)) {
        panelsMap.get(id).feedNext(content);
    }
    syncPanelItem("feed", id, content);
};

export const deletePanel = (id) => {
    if (panelsMap.has(id)) {
        const sub = panelsMap.get(id);
        sub.close();
        panelsMap.delete(id);
    }
    syncPanelItem("delete", id);
};
