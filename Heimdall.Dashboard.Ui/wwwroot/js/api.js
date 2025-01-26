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
    let errors = 0

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
                    //console.log('processing metrics', name, multiple)
                    await Promise.all(options.map(async (x) => {
                        let url = getMetricUrl(x, begin, end);
                        const metrics = await request(url);
                        if (multiple){
                            x['metrics'] = metrics?.data?.result ?? metrics;
                        } else {
                            x['metrics'] = metrics?.data?.result[0] ?? metrics;
                        }
                        //console.log('requested metrics for', x, url)
                    }));
                    
                } catch (err) {
                    errors +=1
                    if (errors > 2){
                        console.info(`Retry's exceeded stopping metrics request`);
                        clearInterval(handel)
                    }
                    console.error(`Unable to get metric, attempt ${errors}`, {err});
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

function streamLogs(url, cb, connections = null) {
    let isApiRequestInProgress = false;
    let errors = 0
    let lastTimestamp = null;
    let id = 0;

    const handel = setInterval(getLogs, 10000);
    getLogs();

    async function getLogs() {
        try {
            if (!isApiRequestInProgress) {
                isApiRequestInProgress = true;

                log_url = url + '&previous=false&timestamps=true&tailLines=500';
                if (lastTimestamp !== null){
                    let DT = luxon.DateTime;
                    let lastTime = DT.fromISO(lastTimestamp);
                    lastTime = lastTime.plus({ seconds: 1 });
                    log_url = url + `&previous=false&timestamps=true&sinceTime=${lastTime.toUTC().toISO()}`
                }
                let logs = ''
                //console.log('fetching log', name, multiple)                
                try {
                    logs = await request(log_url, false);
                    errors = 0
                } catch (err) {
                    errors +=1
                    if (errors > 2){
                        console.info(`Retry's exceeded stopping logs request`);
                        clearInterval(handel)
                    }
                    console.error(`Unable to get logs, attempt ${errors}`, {err});
                } finally {
                    isApiRequestInProgress = false;
                }

                if (!logs) return;

                lines = logs.split(/\r|\r?\n/).map(line => line.trim()).filter(x => x.length > 0);
                if (lines.length == 0) return;
                
                let parsedTime = null;
                enriched = lines.map(x => {
                    matched = x.match(/^\d+\S+/gm);
                    if (matched?.length > 0){
                        timestamp = matched[0];
                        parsedTime = matched[0];
                    } else if (parsedTime !== null) {
                        timestamp = parsedTime
                    } else {
                        timestamp = lastTimestamp
                    }
                    
                    cleaned = x.replace(/^\d+.*?\s/gm, "");
                    
                    return {raw: x, cleaned: cleaned, json: cleaned.startsWith('{'), id: ++id, timestamp: timestamp};
                });

                last = enriched[enriched.length - 1];
                lastTimestamp = last.timestamp;

                cb(enriched);
            }
        } catch (err) {
            console.error('Exception processing logs', {err});
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