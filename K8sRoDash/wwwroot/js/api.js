async function streamResults(url, cb, errCb) {
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

            const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`;
            socket = stream(watchUrl, update, {isJson: true});
        } catch (err) {
            log.error('Error in api request', {err, url});
            if (errCb) errCb(err);
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

    function update(type, object) {
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
                log.error('Error in update', {type, object});
                break;
            default:
                log.error('Unknown update type', {type});
        }

        debouncedCallback();
    }
}

function connectStream(path, cb, onFail, isJson, additionalProtocols) {
    let isClosing = false;
    
    const protocols = [
        'base64.binary.k8s.io',
        ...additionalProtocols,
    ];

    const url = path.replace('http', 'ws');
    const socket = new WebSocket(url, protocols);
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

        log.warn('Socket closed unexpectedly', {path, args});
        onFail();
    }

    function onError(err) {
        log.error('Error in api stream', {err, path});
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
        connection = connectStream(url, cb, onFail, isJson, additionalProtocols);
    }

    function onFail() {
        if (isCancelled) return;

        log.info('Reconnecting in 3 seconds', {url});
        setTimeout(connect, 3000);
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
            log.error('Unable to parse error json', {err});
        }

        const error = new Error(message);
        error.status = status;
        throw error;
    }

    return response.json();
}