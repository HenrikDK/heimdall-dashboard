function toHuman(dur) {
    let result = "";
    if (dur.values.years && Math.abs(dur.values.years) > 0)
    {
        result += Math.abs(dur.values.years) + "y"
        if (Math.abs(dur.values.years) < 10 && Math.abs(dur.values.days) > 0)
        {
            result += Math.abs(dur.values.days) + "d"
        }
        return result;
    }
    
    if (dur.values.days && Math.abs(dur.values.days) > 0)
    {
        result += Math.abs(dur.values.days) + "d"
        if (Math.abs(dur.values.days) < 10 && Math.abs(dur.values.hours) > 0)
        {
            result += Math.abs(dur.values.hours) + "h"
        }
        return result;
    }
    
    if (dur.values.hours && Math.abs(dur.values.hours) > 0)
    {
        result += Math.abs(dur.values.hours) + "h"
        if (Math.abs(dur.values.hours) < 10 && Math.abs(dur.values.minutes) > 0)
        {
            result += Math.abs(dur.values.minutes) + "m"
        }
        return result;
    }
    
    if (dur.values.minutes && Math.abs(dur.values.minutes) > 0)
    {
        result += Math.abs(dur.values.minutes) + "m"
        if (Math.abs(dur.values.minutes) < 10 && Math.abs(dur.values.seconds) > 0)
        {
            result += Math.abs(dur.values.seconds) + "s"
        }
        return result;
    }
    
    return result += Math.abs(dur.values.seconds) + "s"
}

function toHumanValues(dur) {
    let result = [];
    if (dur.values.years && Math.abs(dur.values.years) > 0)
    {
        result.push(Math.abs(dur.values.years) + "y");
    }

    if (dur.values.days && Math.abs(dur.values.days) > 0)
    {
        result.push(Math.abs(dur.values.days) + "d");
    }

    if (dur.values.hours && Math.abs(dur.values.hours) > 0)
    {
        result.push(Math.abs(dur.values.hours) + "h");
    }

    if (dur.values.minutes && Math.abs(dur.values.minutes) > 0)
    {
        result.push(Math.abs(dur.values.minutes) + "m");
    }

    return result
}

function toLocal(value) {
    if (!value) return '';
      
    var DT = window.DateTime || luxon.DateTime;
    let result = DT.fromISO(String(value)).setLocale('da-dk').toFormat('y-LL-dd HH:mm:ss');
    return result;
}

function getMetricUrl(options, begin, end, step = '60s'){
    let host = window.location.origin;
    let query = getMetricQuery(options)

    let result = options.instant ? 
     `${host}/prometheus/api/v1/query?time=${begin.toISO()}&query=` :
     `${host}/prometheus/api/v1/query_range?start=${begin.toISO()}&end=${end.toISO()}&step=${step}&query=`;
    
    result += encodeURIComponent(query)
    return result;
}

function getMetricQuery(options) {
    switch(options.type) {
        case "cluster":
            switch (options.name) {

                // historic
                case "memory-usage":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",instance=~"${options.nodes.join('|')}"}) by (component)`;
                case "cpu-usage":
                    return `sum(rate(node_cpu_seconds_total{kubernetes_node=~"${options.nodes.join('|')}", mode=~"user|system"}[3m]))`;
                
                // instance
                case "memory-available":
                    return `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) by (kubernetes_name)`.replace('_bytes', `_bytes{kubernetes_node=~"${options.nodes.join('|')}"}`);
                case "memory-requests":
                    return `sum(kube_pod_container_resource_requests{node=~"${options.nodes.join('|')}", resource="memory"}) by (component)`;
                case "memory-limits":
                    return `sum(kube_pod_container_resource_limits{node=~"${options.nodes.join('|')}", resource="memory"}) by (component)`;
                case "memory-capacity":
                    return `sum(kube_node_status_capacity{node=~"${options.nodes.join('|')}", resource="memory"}) by (component)`;
                case "memory-allocatable":
                    return `sum(kube_node_status_allocatable{node=~"${options.nodes.join('|')}", resource="memory"}) by (component)`;
                
                // instance
                case "cpu-requests":
                    return `sum(kube_pod_container_resource_requests{node=~"${options.nodes.join('|')}", resource="cpu"}) by (component)`;
                case "cpu-limits":
                    return `sum(kube_pod_container_resource_limits{node=~"${options.nodes.join('|')}", resource="cpu"}) by (component)`;
                case "cpu-capacity":
                    return `sum(kube_node_status_capacity{node=~"${options.nodes.join('|')}", resource="cpu"}) by (component)`;
                case "cpu-allocatable":
                    return `sum(kube_node_status_allocatable{node=~"${options.nodes.join('|')}", resource="cpu"}) by (component)`;
            }
            break;

        case "pod":
            switch (options.name) {
                case "cpu-usage":
                    return `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="", pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
                case "mem-usage":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}) by (pod)`;

                case "fs-writes":
                    return `sum(rate(container_fs_writes_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[3m])) by (pod)`;
                case "fs-reads":
                    return `sum(rate(container_fs_reads_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[3m])) by (pod)`;
                    
                case "net-recv":
                    return `sum(rate(container_network_receive_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
                case "net-sent":
                    return `sum(rate(container_network_transmit_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
            }
            break;
    }
    
    return ''
}

function getMetricLastPoints(metric) {
    if (metric.values.length < 0) return undefined;

    let result = metric.values.slice(-1)[0][1];

    return parseFloat(result);
}

function getInstantMetricValue(options, metric= '') {
    if (options.length < 1) return undefined;
    
    let series = options.filter(x => x.name === metric);
    if (series.length < 1) return undefined;

    let results = series[0].metrics;
    if (results === undefined || results.value === undefined || results.value.length < 1) return undefined;

    return parseFloat(results.value[1])
}

function getMultipleInstantMetricValues(options, metric= '') {
    if (options.length < 1) return undefined;
    
    let series = options.filter(x => x.name === metric);
    if (series.length < 1) return undefined;

    let results = series[0].metrics;
    if (results === undefined || results.length < 1) return undefined;

    result = {}
    results.forEach(x => {
        result[x.metric.namespace] = parseFloat(x.value[1])
    });
    return result;
}

function getDataSeries(options) {
    if (options.length < 1) return [[], 0, {suffix: "", magnitude: 1}];

    if (options[0].metrics.length < 1 || options[0].metrics?.values === undefined) return [[], 0, {suffix: "", magnitude: 1}];
    
    let time = options[0].metrics.values.map(x => x[0]);
    let first = options[0].metrics.values.map(x => parseFloat(x[1]));
    let second = options.length > 1 ? options[1].metrics.values.map(x => parseFloat(x[1])) : [];
    let firstMax = Math.max(...first);
    let secondMax = second.length > 0 ? Math.max(...second) : 0;
    let trueMax = firstMax > secondMax ? firstMax : secondMax;

    let unit = options[0]?.params?.unit === 'bytes' ? getUnitFromBytes(firstMax) : {suffix: "", magnitude: 1};

    let data = time.map((t, index) => {
        let short = luxon.DateTime.fromMillis(t * 1000).toFormat('HH:mm');

        if (second.length < 1){
            return [short, first[index]]
        }

        if (firstMax > secondMax){
            return [short, second[index], first[index]];
        } else{
            return [short, first[index], second[index]];
        }
    });

    options[0].params['max'] = firstMax;
    options[0].data = data;
    if (options.length > 1){
        options[1].data = data;
        options[1].params['max'] = secondMax;
        options[1].params['index'] = secondMax > firstMax ? 2 : 1;
        options[0].params['index'] = firstMax > secondMax ? 2 : 1;
    }

    return [data, trueMax, unit]
}

function getSumSeries(options) {
    if (options.length < 1) return [[], 0, {suffix: "", magnitude: 1}];

    if (options[0].metrics.length < 1) return [[], 0, {suffix: "", magnitude: 1}];
    
    let time = options[0].metrics[0].values.map(x => x[0]);
    let first = []
    
    time.forEach((v, i) => {
        let val = 0;
        options[0].metrics.forEach(y => val += parseFloat(y.values[i][1]));
        first.push(val);
    });

    let second = [];
    if (options.length > 1){
        time.forEach((v, i) => {
            let val = 0;
            options[1].metrics.forEach(y => val += parseFloat(y.values[i][1]));
            second.push(val);
        });    
    }
    let firstMax = Math.max(...first);
    let secondMax = second.length > 0 ? Math.max(...second) : 0;
    let trueMax = firstMax > secondMax ? firstMax : secondMax;

    let unit = options[0]?.params?.unit === 'bytes' ? getUnitFromBytes(firstMax) : {suffix: "", magnitude: 1};

    let data = time.map((t, index) => {
        let short = luxon.DateTime.fromMillis(t * 1000).toFormat('HH:mm');

        if (second.length < 1){
            return [short, first[index]]
        }

        if (firstMax > secondMax){
            return [short, second[index], first[index]];
        } else{
            return [short, first[index], second[index]];
        }
    });

    options[0].params['max'] = firstMax;
    options[0].data = data;
    if (options.length > 1){
        options[1].data = data;
        options[1].params['max'] = secondMax;
        options[1].params['index'] = secondMax > firstMax ? 2 : 1;
        options[0].params['index'] = firstMax > secondMax ? 2 : 1;
    }

    return [data, trueMax, unit]
}

const base = 1024;
const byte_units = [
  {suffix: "B", magnitude: 1},
  {suffix: "KiB", magnitude: base ** 1},
  {suffix: "MiB", magnitude: base ** 2},
  {suffix: "GiB", magnitude: base ** 3},
  {suffix: "TiB", magnitude: base ** 4},
  {suffix: "PiB", magnitude: base ** 5},
  {suffix: "EiB", magnitude: base ** 6},
];

const bytes_regex = /(?<value>[0-9]+(\.[0-9]*)?)(?<suffix>(B|[KMGTPE]iB?))?/;

function unitsToBytes(value) {
  const match = value.match(bytes_regex);

  if (!match?.groups) {
    return NaN;
  }

  const parsedValue = parseFloat(match.groups.value);

  if (!match.groups?.suffix) {
    return parsedValue;
  }

  const unit = byte_units.filter(x => x.suffix === match.groups.suffix)[0];

  return parseInt((parsedValue * unit.magnitude).toFixed(1));
}

function memoryUnitToBytes(value){
    if (!value){
        return 0;
    }

    let n = value.slice(-2);
    let digits = value.slice(0, -2);
    const isDigit = /\d+/.test(n);

    if (isDigit){
      return parseFloat(value);
    }
    
    const converters = byte_units.filter(x => x.suffix.startsWith(n));
  
    if (converters.length === 0) {
      return 0;
    }
  
    return parseFloat(digits) * converters[0].magnitude;
}

function bytesToUnits(bytes, precision = 1){
  let unit = getUnitFromBytes(bytes);

  return `${(bytes / unit.magnitude).toFixed(precision)}${unit.suffix}`;
}

function getUnitFromBytes(bytes){
    if (bytes <= 0 || isNaN(bytes) || !isFinite(bytes)) {
        return "N/A";
    }

    const index = Math.floor(Math.log(bytes) / Math.log(base));

    if (index < byte_units.length - 1){
        return byte_units[index];
    }
    
    return byte_units[byte_units.length -1];
}


const cpu_units = [
    {suffix: "n", magnitude: 1000 ** -3},
    {suffix: "u", magnitude: 1000 ** -2},
    {suffix: "m", magnitude: 1000 ** -1}, // milli
    {suffix: "",  magnitude: 1}, // no units
    {suffix: "k", magnitude: 1000 ** 1},
    {suffix: "M", magnitude: 1000 ** 2},
    {suffix: "G", magnitude: 1000 ** 3},
    {suffix: "P", magnitude: 1000 ** 4},
    {suffix: "T", magnitude: 1000 ** 5},
    {suffix: "E", magnitude: 1000 ** 6},
  ];

function cpuUnitsToNumber(value) {
    if (!value){
        return 0;
    }

    let n = value.slice(-1);
    let digits = value.slice(0, -1);
    const isDigit = /\d+/.test(n);

    if (isDigit){
      return parseFloat(value);
    }
    
    const converters = cpu_units.filter(x => x.suffix == n);
  
    if (converters.length === 0) {
      return 0;
    }
  
    return parseFloat(digits) * converters[0].magnitude;
}

function getEntityLink(row) {
    if (['Deployment', 'DaemonSet', 'StatefulSet', 'Job', 'CronJob', ].includes(row.kind))
    {
        return { name: 'workload-details', params: { namespace: row.metadata.namespace, type: row.kind.toLowerCase(), name: row.metadata.name }}   
    }
    
    return { name: 'pod-details', params: { namespace: row.metadata.namespace, name: row.metadata.name }}
};

function roundUp(v, n) {
    return Math.ceil(v * Math.pow(10, n)) / Math.pow(10, n);
}

function roundUpStep(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.ceil(value * inv) / inv;
}