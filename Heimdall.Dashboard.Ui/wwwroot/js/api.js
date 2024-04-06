function closeConnections(connections){
    connections.forEach(x => {
        try {
            x();
        } catch (err) {
            console.error('Unable to close connection', {err});
        }
    });
}

function streamMetrics(url, cb, connections = null) {
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
    if (connections){
        connections.push(cancel)
    }

    return cancel;

    function cancel() {
        clearInterval(handel);
    }
}

async function streamLogs(url, cb, connections = null) {
    const watchUrl = url.replace('http', 'ws');
    let ending = ''
    const {cancel} = stream(watchUrl, transformer, false);
    if (connections){
        connections.push(cancel)
    }
    return cancel;

    function transformer(item) {
        if (!item) return; // This api returns a lot of empty strings

        let message = atob(item);
        if (ending.length > 0){
            message = ending + message;
        }
        
        let lines = message.split('\n');
        if (!message.endsWith('\n')){
            ending = lines[lines.length - 1];
            lines = lines.slice(0, -1);
        } else{
            ending = '';
        }
        
        if (lines[lines.length - 1].length === 0){
            lines = lines.slice(0, -1);
        }
        
        cb(lines);
    }
}

async function streamResults(url, cb, connections = null) {
    let isCancelled = false;
    let socket = {};
    const results = {};

    const debouncedCallback = _.debounce(() => {
        const values = Object.values(results);
        cb(values);
    }, 250, {leading: true});

    run();

    if (connections){
        connections.push(cancel)
    }
    return cancel;

    async function run() {
        try {
            const {kind, items, metadata} = await request(url);
            if (isCancelled) return;

            add(items, kind);

            const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`.replace('http', 'ws');
            socket = stream(watchUrl, update, true);
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

            socket = stream(watchUrl, x => debouncedCallback(x.object), true);
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

function stream(url, cb, isJson) {
    let connection = {
        close: () => {return null;},
        socket: {}
    };
    let isCancelled = false;

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
    
    const socket = isJson ? new WebSocket(path) : new WebSocket(path, ['base64.binary.k8s.io']);
    if (!isJson){
        socket.binaryType = 'arraybuffer';
    }
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