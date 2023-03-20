function nodeMemory(used = 0, available = 1){
    var nodes_ram = {
        title: {
            text: 'NODE RAM USE',
            subtext: 'Used vs Available',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return used + ' / ' + available + '\nGB'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: used, name: 'Used' },
                    { value: available, name: 'Available' },
                ]
            }
        ]
    };
    
    return nodes_ram;
}

function nodeCpu(used = 0, available = 1){
    var nodes_cpu = {
        title: {
            text: 'NODE CPU USE',
            subtext: 'Used vs Available',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return used + ' / ' + available + '\nCores'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: used, name: 'Used' },
                    { value: available, name: 'Available' },
                ]
            }
        ]
    };
    return nodes_cpu;
}

function nodeReady(ready = 0, waiting = 1){
    var nodes_ready = {
        title: {
            text: 'NODES',
            subtext: 'Ready vs All',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return  ready + ' / ' + (ready + waiting) + '\nNodes' }
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: ready, name: 'Ready' },
                    { value: 0, name: 'Loading'},
                    { value: waiting, name: 'Waiting' },
                ]
            }
        ]
    };
    return nodes_ready;
}

function podReady(ready = 0, requested = 1){
    var pods_ready = {
        title: {
            text: 'PODS',
            subtext: 'Ready vs Requested',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return ready + ' / ' + (ready + requested)}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: ready, name: 'Ready' },
                    { value: 0, name: '' },
                    { value: requested, name: 'Requested' },
                ]
            }
        ]
    };
    return pods_ready;
}

function podMemory(reserved = 0, available = 1){
    var pod_memory = {
        title: {
            text: 'POD RAM USE',
            subtext: 'Actual vs Reserved',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return reserved + ' / '+ (available + reserved) + '\nGB'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: reserved, name: 'Reserved' },
                    { value: available, name: 'Available' },
                ]
            }
        ]
    };
    return pod_memory;
}

function podCpu(used = 0, available = 1){
    var pod_cpu = {
        title: {
            text: 'POD CPU USE',
            subtext: 'Actual vs Reserved',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Nodes',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return used + ' / ' + (available + used) + '\nCores'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: used, name: 'Used' },
                    { value: available, name: 'Available' },
                ]
            }
        ]
    };
    
    return pod_cpu
}

function workloadsReady(ready = 0, waiting = 1){
    var workloads_ready = {
        title: {
            text: 'WORKLOADS',
            subtext: 'Ready vs Requested',
            bottom:'5%',
            textStyle: {
                fontSize: '16'
            },
            subtextStyle: {
                fontSize: '16',
            },
            left: 'center',
        },
        tooltip: {
            show: false,
            trigger: 'none'
        },
        backgroundColor: '',
        legend: {
            show: false,
        },
        series: [
            {
                name: 'Workloads',
                type: 'pie',
                top: '-5%',
                height: '85%',
                radius: ['55%', '85%'],
                animationDuration: 300,
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return ready + ' / ' + (ready + waiting) + '\nNodes' }
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: ready, name: 'Ready' },
                    { value: 0, name: 'Loading'},
                    { value: waiting, name: 'Waiting' },
                ]
            }
        ]
    };
    return workloads_ready;
}

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

function historic(){
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
                data: ['18:30', '18:40', '18:50', '19:00', '19:10', '19:20', '19:30', '19:40', '19:50', '20:00', '20:10', '20:20'],
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Memory GiB',
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
                type: 'value',
                name: 'CPU (vCores)',
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
                data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
            },
            {
                name: 'Memory',
                type: 'line',
                animationDuration: 300,
                data: [
                    2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 150.6, 170.0, 96.4, 83.3
                ]
            }
        ]
    };
    return option;
}

function current(type = ''){
    let usage = []
    let requests = []
    let limits = []

    usage = [
        { value: 40, name: 'Usage', formatted: '15.5 vCores' },
        { value: 60, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } },
    ]

    requests = [
        { value: 64, name: 'Requests', formatted: '29 vCores' },
        { value: 37, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } },
    ]

    limits = [
        { value: 95, name: 'Limits', formatted: '55 vCores' },
        { value: 5, name: '', emphasis :{disabled:true}, itemStyle: { color: 'lightgray', opacity:0.2 } }
    ];

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
                'Requests',
                'Limits',
                'Usage',
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

function historicCpu(){
    option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['18:30', '18:40', '18:50', '19:00', '19:10', '19:20', '19:30']
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
                data: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2.5],
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
                data: [0.82, 0.932, 0.901, 0.934, 1.290, 1.330, 1.320],
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

function historicMemory(){
    option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['18:30', '18:40', '18:50', '19:00', '19:10', '19:20', '19:30']
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
                data: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
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
                data: [0.82, 0.932, 0.901, 0.934, 1.290, 1.130, 1.020],
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