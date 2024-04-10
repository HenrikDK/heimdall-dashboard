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

function getMetricUrl(options, begin, end, step = '60s'){
    let host = window.location.origin;
    let query = getMetricQuery(options)
    let result = `${host}/prometheus/api/v1/query_range?start=${begin.toISO()}&end=${end.toISO()}&step=${step}&query=`;
    result += encodeURIComponent(query)
    return result;
}

function getMetricQuery(options) {
    switch(options.type) {
        case "cluster":
            switch (options.name) {
                case "node-memory-stats":
                    return `sum(node_memory_MemTotal_bytes{kubernetes_node=~"${options.nodes}"} - (node_memory_MemFree_bytes{kubernetes_node=~"${options.nodes}"} + node_memory_Buffers_bytes{kubernetes_node=~"${options.nodes}"} + node_memory_Cached_bytes{kubernetes_node=~"${options.nodes}"})) by (component)`;
                case "container-memory":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",instance=~"${options.nodes}"}) by (component)`;
                case "kube-memory-stats":
                    return `sum({__name__=~"kube_pod_container_resource_requests|kube_pod_container_resource_limits|kube_node_status_capacity|kube_node_status_allocatable", kubernetes_node=~"${options.nodes}", resource="memory"}) by (__name__, component)`;

                case "node-cpu-stats":
                    return `sum(rate(node_cpu_seconds_total{kubernetes_node=~"${options.nodes}", mode=~"user|system"}[1m]))`;
                case "kube-cpu-stats":
                    return `sum({__name__=~"kube_pod_container_resource_requests|kube_pod_container_resource_limits|kube_node_status_capacity|kube_node_status_allocatable", kubernetes_node=~"${options.nodes}", resource="cpu"}) by (__name__, component)`;
            }
            break;
        case "pod":
            switch (options.name) {
                case "cpu-usage":
                    return `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
                case "memory-usage":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}) by (pod)`;

                case "fs-writes":
                    return `sum(rate(container_fs_writes_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[3m])) by (pod)`;
                case "fs-reads":
                    return `sum(rate(container_fs_reads_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[3m])) by (pod)`;
                    
                case "network-received":
                    return `sum(rate(container_network_receive_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
                case "network-sent":
                    return `sum(rate(container_network_transmit_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[3m])) by (pod)`;
            }
            break;
    }
    
    return ''
}

function getMetricLastPoints(data, metric= '') {
    let metrics = data
    if (metric.length > 0){
        metrics = metrics.filter(x => x.metric["__name__"] === metric)
    }
    let result = metrics.map(x => {
        try {
            return x.values.slice(-1)[0][1];
        } catch {
            return undefined;
        }
    });

    return parseFloat(result[0]);
}

function getDataSeries(options) {
    if (options.length < 1) return [];
    
    let time = options[0].metrics.values.map(x => x[0]);
    let first = options[0].metrics.values.map(x => parseFloat(x[1]));
    let second = options.length > 1 ? options[1].metrics.values.map(x => parseFloat(x[1])) : [];
    let firstMax = Math.max(first);
    let secondMax = second.length > 0 ? Math.max(second) : 0;
    let trueMax = firstMax > secondMax ? firstMax : secondMax;

    let unit = first?.params?.unit === 'bytes' ? getUnitFromBytes(firstMax) : {suffix: "", magnitude: 1};

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
const units = [
  {suffix: "B", magnitude: 1},
  {suffix: "KiB", magnitude: base ** 1},
  {suffix: "MiB", magnitude: base ** 2},
  {suffix: "GiB", magnitude: base ** 3},
  {suffix: "TiB", magnitude: base ** 4},
  {suffix: "PiB", magnitude: base ** 5},
  {suffix: "EiB", magnitude: base ** 6},
];

const unitRegex = /(?<value>[0-9]+(\.[0-9]*)?)(?<suffix>(B|[KMGTPE]iB?))?/;

function unitsToBytes(value) {
  const match = value.match(unitRegex);

  if (!match?.groups) {
    return NaN;
  }

  const parsedValue = parseFloat(match.groups.value);

  if (!match.groups?.suffix) {
    return parsedValue;
  }

  const unit = units.filter(x => x.suffix === match.groups.suffix)[0];

  return parseInt((parsedValue * unit.magnitude).toFixed(1));
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

    if (index < magnitudes.length - 1){
        return magnitudes[index];
    }
    
    return magnitudes[magnitudes.length -1];
}
