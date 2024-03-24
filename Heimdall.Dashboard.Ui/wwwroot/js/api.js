function streamMetrics(url, cb) {
    let isApiRequestInProgress = false;
    const handel = setInterval(getMetrics, 30000);
    getMetrics();

    async function getMetrics() {
        try {
            if (!isApiRequestInProgress) {
                isApiRequestInProgress = true;
                try {
                    const metric = await request(url);
                    cb(metric.items || metric);
                } catch (err) {
                    console.error('Unable to send request', {err});
                } finally {
                    isApiRequestInProgress = false;
                }
            }
        } catch (err) {
            console.error('No metrics', {err, url});
        }
    }

    return cancel;

    function cancel() {
        clearInterval(handel);
    }
}

async function streamLogs(url, cb) {
    const items = [];
    const watchUrl = url.replace('http', 'ws');
    const {cancel} = stream(watchUrl, transformer, {isJson: false, connectCb});
    return cancel;

    function connectCb() {
        items.length = 0;
    }

    function transformer(item) {
        if (!item) return; // This api returns a lot of empty strings

        const message = atob(item);
        try {
            let item = JSON.parse(message)
            items.push(item)
        } catch (e){
            items.push(message);
        }
        cb(items);
    }
}

async function streamResults(url, cb) {
    let isCancelled = false;
    let socket = {};
    const results = {};

    const debouncedCallback = _.debounce(() => {
        const values = Object.values(results);
        cb(values);
    }, 250, {leading: true});

    run();

    return cancel;

    async function run() {
        try {
            const {kind, items, metadata} = await request(url);
            if (isCancelled) return;

            add(items, kind);

            const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`.replace('http', 'ws');
            socket = stream(watchUrl, update, {isJson: true});
        } catch (err) {
            console.error('Error in api request', {err, url});
        }
    }

    function cancel() {
        if (isCancelled) return;
        isCancelled = true;

        if (socket) socket.cancel();
    }

    function add(items, kind) {
        const fixedKind = kind.slice(0, -4); // Trim off the word "List" from the end of the string
        for (const item of items) {
            item.kind = fixedKind;
            results[item.metadata.uid] = item;
        }

        debouncedCallback();
    }

    function update({object, type}) {
        object.actionType = type;

        switch (type) {
            case 'ADDED':
                results[object.metadata.uid] = object;
                break;
            case 'MODIFIED': {
                const existing = results[object.metadata.uid];

                if (existing) {
                    const currentVersion = parseInt(existing.metadata.resourceVersion, 10);
                    const newVersion = parseInt(object.metadata.resourceVersion, 10);
                    if (currentVersion < newVersion) {
                        Object.assign(existing, object);
                    }
                } else {
                    results[object.metadata.uid] = object;
                }

                break;
            }
            case 'DELETED':
                delete results[object.metadata.uid];
                break;
            case 'ERROR':
                console.error('Error in update', {type, object});
                break;
            default:
                console.error('Unknown update type', {type});
        }

        debouncedCallback();
    }
}

async function streamResult(url, name, cb) {
    let isCancelled = false;
    let socket= {};
    run();

    return cancel;

    async function run() {
        try {
            const item = await request(`${url}/${name}`);
            const debouncedCallback = _.debounce(cb, 250, {leading: true});

            if (isCancelled) return;
            debouncedCallback(item);

            const fieldSelector = encodeURIComponent(`metadata.name=${name}`);
            const watchUrl = `${url}?watch=1&fieldSelector=${fieldSelector}`.replace('http', 'ws');

            socket = stream(watchUrl, x => debouncedCallback(x.object), {isJson: true});
        } catch (err) {
            console.error('Error in api request', {err, url});
        }
    }

    function cancel() {
        if (isCancelled) return;
        isCancelled = true;

        if (socket) socket.cancel();
    }
}

function stream(url, cb, args) {
    let connection = {
        close: () => {return null;},
        socket: {}
    };
    let isCancelled = false;
    const {isJson, additionalProtocols, connectCb} = args;

    connect();

    return {cancel, getSocket};

    function getSocket() {
        return connection.socket;
    }

    function cancel() {
        if (connection) connection.close();
        isCancelled = true;
    }

    function connect() {
        if (connectCb) connectCb();
        connection = connectStream(url, cb, onFail, isJson);
    }

    function onFail() {
        if (isCancelled) return;

        console.info('Reconnecting in 3 seconds', {url});
        setTimeout(connect, 3000);
    }
}

function connectStream(path, cb, onFail, isJson) {
    let isClosing = false;

    const socket = new WebSocket(path, ['base64.binary.k8s.io']);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);

    return {close, socket};

    function close() {
        isClosing = true;
        socket.close();
    }

    function onMessage(body) {
        if (isClosing) return;

        const item = isJson ? JSON.parse(body.data) : body.data;
        cb(item);
    }

    function onClose(...args) {
        if (isClosing) return;
        isClosing = true;

        socket.removeEventListener('message', onMessage);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('error', onError);

        console.warn('Socket closed unexpectedly', {path, args});
        onFail();
    }

    function onError(err) {
        console.error('Error in api stream', {err, path});
    }
}

async function request(path) {
    const response = await fetch(path);

    if (!response.ok) {
        const {status, statusText} = response;
        let message = `Api request error: ${statusText}`;
        try {
            const json = await response.json();
            message += ` - ${json.message}`;
        } catch (err) {
            message += ` - Unable to parse error json ${err}`
        }

        const error = new Error(message);
        error.status = status;
        throw error;
    }

    return response.json();
}