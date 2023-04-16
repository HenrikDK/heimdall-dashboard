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

function getMetric(type, name, options = {}){
    var DT = luxon.DateTime;
    let end = DT.now();
    let begin = end.minus({ hours: 1 });
    
    let result = `/query_range?start=${begin.toUTC().toISO()}&end=${end.toUTC().toISO()}&step=60s&query=`;
    result += getMetricQuery(type, name, options)
    return result;
}

function getMetricQuery(type = '', name = '', options = {}) {
    switch(type) {
        case "cluster":
            switch (name) {
                case "node-memory-stats":
                    return `sum({__name__=~"node_memory_MemTotal_bytes|node_memory_MemFree_bytes|node_memory_Buffers_bytes|node_memory_Cached_bytes", kubernetes_node=~"${options.nodes}"}) by (__name__, component)`;
                case "container-memory":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",instance=~"${options.nodes}"}) by (component)`;
                case "kube-memory-stats":
                    return `sum({__name__=~"kube_pod_container_resource_requests|kube_pod_container_resource_limits|kube_node_status_capacity|kube_node_status_allocatable", node=~"${options.nodes}", resource="memory"}) by (__name__, component)`;

                case "node-cpu-stats":
                    return `sum(rate(node_cpu_seconds_total{kubernetes_node=~"${options.nodes}", mode=~"user|system"}[1m]))`;
                case "kube-cpu-stats":
                    return `sum({__name__=~"kube_pod_container_resource_requests|kube_pod_container_resource_limits|kube_node_status_capacity|kube_node_status_allocatable", node=~"${options.nodes}", resource="cpu"}) by (__name__, component)`;
            }
            break;
        case "pods":
            switch (name) {
                case "cpuUsage":
                    return `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}[1m])) by (${options.selector})`;
                case "cpuRequests":
                    return `sum(kube_pod_container_resource_requests{pod=~"${options.pods}",resource="cpu",namespace="${options.namespace}"}) by (${options.selector})`;
                case "cpuLimits":
                    return `sum(kube_pod_container_resource_limits{pod=~"${options.pods}",resource="cpu",namespace="${options.namespace}"}) by (${options.selector})`;
                case "memoryUsage":
                    return `sum(container_memory_working_set_bytes{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}) by (${options.selector})`;
                case "memoryRequests":
                    return `sum(kube_pod_container_resource_requests{pod=~"${options.pods}",resource="memory",namespace="${options.namespace}"}) by (${options.selector})`;
                case "memoryLimits":
                    return `sum(kube_pod_container_resource_limits{pod=~"${options.pods}",resource="memory",namespace="${options.namespace}"}) by (${options.selector})`;
                case "fsUsage":
                    return `sum(container_fs_usage_bytes{container!="POD",container!="",pod=~"${options.pods}",namespace="${options.namespace}"}) by (${options.selector})`;
                case "fsWrites":
                    return `sum(rate(container_fs_writes_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[1m])) by (${options.selector})`;
                case "fsReads":
                    return `sum(rate(container_fs_reads_bytes_total{container!="", pod=~"${options.pods}", namespace="${options.namespace}"}[1m])) by (${options.selector})`;
                case "networkReceive":
                    return `sum(rate(container_network_receive_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[1m])) by (${options.selector})`;
                case "networkTransmit":
                    return `sum(rate(container_network_transmit_bytes_total{pod=~"${options.pods}",namespace="${options.namespace}"}[1m])) by (${options.selector})`;
            }
            break;
    }
    
    return ''
}
