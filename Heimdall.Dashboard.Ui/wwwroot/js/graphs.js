function workload(type = 'Unknown', running = 0, pending = 0){
    let data = [];
    let active = false;
    
    if (running > 0 || pending > 0){
        let runningName = running > 0 ? 'Running': '';
        let pendingName = pending > 0 ? 'Pending': '';
        data = [
            { value: 0, name: '', percentage: 0 },
            { value: running, name: runningName, percentage: running/(running + pending) },
            { value: pending, name: pendingName, percentage: pending/(running + pending) }
        ];
        
        active = true;
    }
    
    var graph = {
        tooltip: {
            trigger: 'item',
            formatter: function (params){
                return res = params.name + " : " + Math.round(params.percent) + '% </br>';
            }
        },
        title: {
            text: `${type} (${running + pending})`,
            left: 'center',
        },
        backgroundColor: '',
        legend: {
            top: '78%',
            left: 'center',
            show: active,
            formatter: formatter = function (name) {
                let value = data
                    .filter((a) => a.name === name)
                    .map((a) => a.value)[0];
                return `${name}  ${value}`;
            },
            itemGap: 20,
            selectedMode: false,
            orient: 'vertical',
        },
        series: [
            {
                top: '-15%',
                name: 'Pods',
                type: 'pie',
                animationDuration: 300,
                radius: ['65%', '80%'],
                label: {
                    show: false,
                },
                emptyCircleStyle:{ opacity: 0.2 },
                data: data
            },
        ]
    };

    return graph
}

function historic(memory = {}, compute = {}, time=[]){
    const colors = ['#5470C6', '#91CC75', '#EE6666'];
    option = {
        color: colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        backgroundColor: '',
        grid: {
            left: '5%',
            right: '5%',
            top: '7%',
            bottom: '5%',
        },
        legend: {
            data: ['CPU', 'Memory']
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                axisTick: {
                    alignWithLabel: true
                },
                data: time,
            }
        ],
        yAxis: [
            {
                max: memory.max,
                type: 'value',
                name: `Memory (${memory.unit ?? 'GiB'})`,
                position: 'right',
                alignTicks: true,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colors[1]
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                max: compute.max,
                type: 'value',
                name: `CPU (${compute.unit ?? 'vCores'})`,
                position: 'left',
                alignTicks: true,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colors[0]
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        series: [
            {
                name: 'CPU',
                type: 'line',
                animationDuration: 300,
                yAxisIndex: 1,
                data: compute.data
            },
            {
                name: 'Memory',
                type: 'line',
                animationDuration: 300,
                data: memory.data
            }
        ]
    };
    return option;
}

function current(type = '', unit = '', usageValues= {}, requestsValues = {}, limitsValues = {}){
    let usage = []
    let requests = []
    let limits = []

    usage = []
    let usageUnits = usageValues.units ?? 0;
    let usagePct = usageValues.pct ?? 0; 
    if (usagePct > 0){
        usage.push({ value: usagePct, name: 'Usage', formatted: `${usageUnits} ${unit}` })
    }
    usage.push({ value: 100 - usagePct, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } })
    
    requests = []
    let requestUnits = requestsValues.units ?? 0;
    let requestPct = requestsValues.pct ?? 0;
    if (requestPct > 0){
        requests.push({ value: requestPct, name: 'Requests', formatted: `${requestUnits} ${unit}` })
    }
    requests.push({ value: 100 - requestPct, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } })

    limits = [];
    let limitsPct = limitsValues.pct ?? 0;
    let limitsUnits = limitsValues.units ?? 0
    if (limitsPct > 0){
        limits.push({ value: limitsPct, name: 'Limits', formatted: `${limitsUnits} ${unit}`})
    }
    limits.push({ value: 100 - limitsPct, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } })

    let data = [...limits, ...requests, ...usage];

    option = {
        title: {
            text: type,
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params){
                if (params.name){
                    return res = params.name + " : " + Math.round(params.percent) + '% </br>';
                }
                return ''
            }
        },
        grid: {
            left: '5%',
            right: '5%',
            top: '7%',
            bottom: '5%',
        },        
        backgroundColor: '',
        legend: {
            top:'75%',
            data: [
                'Usage',
                'Requests',
                'Limits'
            ],
            formatter: formatter = function (name) {
                let value = data
                    .filter((a) => a.name === name)
                    .map((a) => a.formatted)[0];
                return `${name}:  ${value}`;
            },
            left: 'center',
            show: true,
            selectedMode: false,
            itemGap: 10,
            orient: 'vertical',
        },
        series: [
            {
                top: '-15%',
                name: type,
                type: 'pie',
                animationDuration: 300,
                radius: ['50%', '60%'],
                label: {
                    show: false,
                },
                emptyCircleStyle:{ opacity: 0.2 },
                data: limits
            },
            {
                top: '-15%',
                name: type,
                type: 'pie',
                animationDuration: 300,
                radius: ['65%', '75%'],
                label: {
                    show: false,
                },
                emptyCircleStyle:{ opacity: 0.2 },
                data: requests
            },
            {
                top: '-15%',
                name: type,
                type: 'pie',
                animationDuration: 300,
                radius: ['80%', '90%'],
                label: {
                    show: false,
                },
                emptyCircleStyle:{ opacity: 0.2 },
                data: usage
            }
        ]
    };
    
    return option;
}

function historicCpu(usage = [], limits = [], time = []){
    option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        yAxis: {
            type: 'value',
            name: 'CPU (vCores)',
            position: 'right',
            axisLine: {
                show: true,
            },
        },
        backgroundColor: '',
        grid: {
            left: '7%',
            right: '10%',
            top: '10%',
            bottom: '7%',
        },
        series: [
            {
                name: 'Limit',
                animationDuration: 300,
                z: '-1',
                data: limits,
                type: 'line',
                color: 'lightgray',
                emphasis :{
                    disabled: true
                },
                opacity: 0.1,
                lineStyle: {
                    color: 'lightgray'
                },
                areaStyle: {
                    opacity: 0.1,
                    color: 'lightgray'
                }
            },
            {
                name: 'CPU',
                animationDuration: 300,
                z: '10',
                data: usage,
                type: 'line',
                opacity: 0.4,
                areaStyle: {
                    opacity: 0.4,
                }
            },
        ]
    };
    return option;
}

function historicMemory(usage = [], limits = [], time = []){
    option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        yAxis: {
            type: 'value',
            name: 'Memory (GiB)',
            position: 'right',
            axisLine: {
                show: true,
            },
        },
        backgroundColor: '',
        grid: {
            left: '7%',
            right: '10%',
            top: '10%',
            bottom: '7%',
        },
        series: [
            {
                name: 'Limit',
                animationDuration: 300,
                z: '-1',
                data: limits,
                type: 'line',
                color: 'lightgray',
                emphasis :{
                    disabled: true
                },
                opacity: 0.1,
                lineStyle: {
                    color: 'lightgray'
                },
                areaStyle: {
                    opacity: 0.1,
                    color: 'lightgray'
                }
            },
            {
                name:'',
                animationDuration: 300,
                type: 'line',
                data: [],
            },
            {
                name: 'Memory',
                animationDuration: 300,
                z: '10',
                data: usage,
                type: 'line',
                opacity: 0.4,
                areaStyle: {
                    opacity: 0.4,
                }
            },
        ]
    };
    
    return option;
}

function renderSortedStackedBarChart(params, api){
    let start = api.coord([api.value(0), api.value(1 + params.seriesIndex)]);
    let size = api.size([1, api.value(1 + params.seriesIndex)]);
    let style = api.style();
    height = size[1];
    if (params.seriesIndex > 0){
      let size2 = api.size([1, api.value(1)]);
      height = api.value(1) ? size[1] - size2[1] : size[1];
    }
    
    return {
      type: 'group',
      children: [
        {
      type: 'rect',
      shape: {
        x: start[0] - size[0] * 0.5,
        y: start[1],
        width: size[0],
        height: height
      },
      style: {...style,
          opacity: 0.2
        }
      },
      {
        type: 'rect',
        shape: {
          x: start[0] - size[0] * 0.5,
          y: start[1],
          width: size[0],
          height: 3,
        },
        style: style,
      }
      ]
    };
};

function getSimpleChart(){
    let option = {
        animation: false,
        backgroundColor: '',
        tooltip: {
            trigger: 'axis',
            axisPointer: { 
            type: 'shadow',
            shadowStyle:{
                color: '#a9a9a9',
                opacity: 0.07
            }
            }
        },
        xAxis: {
            type: 'category'
        },
        legend: {
            show: true,
            selectedMode: false,
            top: 'bottom'
        },
        yAxis: {
            type: 'value',
            position: 'right',
        },
        grid: {
            left: '2%',
            right: '10%',
            top: '5%',
            bottom: '14%',
        },
        series: []
    };

    return option;
}

function updateSimpleChart(options, series = [], unit, limit = 0, max = 0){
    options.yAxis['axisLabel'] = {
        formatter: unit.suffix !== '' ? '{value} ' + unit.suffix : '{value}'
    }

    if (max > 0){
        options.yAxis['max'] = max
    }

    let first = getSimpleSeries(series[0], data);

    if (limit > 0){
        let line = getLimitMarkLine(limit);
        first['markLine'] = line;
    }
    options.series.splice(0, options.series.length);
    options.series.push(first);

    if (series.length < 2) return options;

    let second = getSimpleSeries(series[1], data);
    options.series.push(second);

    return options;
}

function getLimitMarkLine(limit){
    let line = {
        symbol: 'none',
        data: [
        {
            yAxis: limit,
            lineStyle:{
                color: 'lightgray',
                width: 2,
                type:'solid'
            
            },
            emphasis: {disabled: true},
            label: {
                position: 'end',
                formatter: 'Limit'
            },

        }]
    }

    return line;
}

function getSimpleSeries(params, data){
    let series = {
        type: 'custom',
        name: params.name,
        emphasis: {disabled: true},
        stack: 'yes',
        renderItem: renderSortedStackedBarChart,
        label: { show: false },
        dimensions: ['time', 'value'],
        encode: {
            x: 0,
            y: params.index
        },
        data: data
    }

    return series;
}