function closeConnections(connections){
    connections.forEach(x => {
        try {
            x();
        } catch (err) {
            console.error('Unable to close connection', {err});
        }
    });
}

function streamMetrics(options, cb, connections = null, multiple = false) {
    var DT = luxon.DateTime;
    let isApiRequestInProgress = false;

    const handel = setInterval(getMetrics, 30000);
    getMetrics();

    async function getMetrics() {
        try {
            if (!isApiRequestInProgress) {
                isApiRequestInProgress = true;

                let now = DT.utc();
                
                if (now.toObject().second >= 30){
                    now = now.set({second: 30, millisecond: 0});
                } else {
                    now = now.set({second: 0, millisecond: 0});
                }
                let end = now;
                let begin = end.minus({ hours: 1 });

                try {
                    await Promise.all(options.map(async (x) => {
                        let url = getMetricUrl(x, begin, end);
                        const metrics = await request(url);
                        if (multiple){
                            x['metrics'] = metrics?.data?.result ?? metrics;
                        } else {
                            x['metrics'] = metrics?.data?.result[0] ?? metrics;
                        }
                    }));
                    
                } catch (err) {
                    console.error('Unable to send request', {err});
                } finally {
                    isApiRequestInProgress = false;
                }
                cb(options);
            }
        } catch (err) {
            console.error('No metrics', {err, options});
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

async function streamLogs(path, cb, connections = null) {
    var host = window.location.origin;
    let url = host + path;
    let id = 0;
    const watchUrl = url.replace('http', 'ws');
    let ending = ''
    const {cancel} = stream(watchUrl, transformer, false, true, fail);
    if (connections){
        connections.push(cancel)
    }
    return cancel;

    function fail(){
        id = 0;
        ending = '';
    }

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
        
        if (lines[lines.length - 1]?.length === 0){
            lines = lines.slice(0, -1);
        }

        lines = lines.map(x => ({raw: x, json: x.startsWith('{'), id: ++id}))
        
        cb(lines);
    }
}

async function streamResults(path, cb, connections = null) {
    var host = window.location.origin;
    let url = host + path;
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

async function streamResult(path, name, cb) {
    var host = window.location.origin;
    let url = host + path;
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

            socket = stream(watchUrl, x => debouncedCallback(x.object), true, false, null);
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

function stream(url, cb, isJson, isLog, cbf) {
    let connection = {
        close: () => {return null;},
        socket: {}
    };
    let retry = 0;
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

        if (isLog && retry > 2){
            console.info('Connect Failed more than 3 times, giving up.', {url});
            return;
        }

        if (isLog && retry < 3){
            retry += 1;
        }

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

async function request(path, json=true) {
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
    if (!json) return response.text();

    return response.json();
}