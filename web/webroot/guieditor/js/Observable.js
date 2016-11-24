class Observable {

    constructor(serverCfg) {
        this.listeners = new Map();
    }

    addListener(label, callback) {
        this.listeners.has(label) || this.listeners.set(label, []);
        if (callback._listenerMark) {//TODO refactor
            return;
        }
        callback._listenerMark = true;
        this.listeners.get(label).push(callback);
    }

    emit(label, ...args) {
        let listeners = this.listeners.get(label);

        if (listeners && listeners.length) {
            listeners.forEach((listener) => {
                listener(...args);
            });
        return true;
        }
        return false;
    }

    clearEvents() {
        this.listeners = new Map();
    }
}