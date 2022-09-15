function nodeMemory(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '25 / 48\nGB'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 25, name: 'Used' },
                    { value: 7, name: 'Available' },
                ]
            }
        ]
    };
    
    return nodes_ram;
}

function nodeCpu(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '103 / 116\nCores'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 103, name: 'Used' },
                    { value: 13, name: 'Available' },
                ]
            }
        ]
    };
    return nodes_cpu;
}

function nodeReady(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '7 / 8\nNodes' }
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 7, name: 'Ready' },
                    { value: 0, name: 'Loading'},
                    { value: 1, name: 'Waiting' },
                ]
            }
        ]
    };
    return nodes_ready;
}

function podReady(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '25 / 27'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 25, name: 'Ready' },
                    { value: 0, name: '' },
                    { value: 2, name: 'Requested' },
                ]
            }
        ]
    };
    return pods_ready;
}

function podMemory(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '15 / 48\nGB'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 15, name: 'Reserved' },
                    { value: 33, name: 'Available' },
                ]
            }
        ]
    };
    return pod_memory;
}

function podCpu(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '13 / 116\nCores'}
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 13, name: 'Used' },
                    { value: 103, name: 'Available' },
                ]
            }
        ]
    };
    
    return pod_cpu
}

function workloadsReady(){
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
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: 'center',
                    fontSize: '16',
                    fontWeight: 'bold',
                    formatter: (s) => { return '7 / 8\nNodes' }
                },
                emphasis: {
                    show: false,
                },
                data: [
                    { value: 7, name: 'Ready' },
                    { value: 0, name: 'Loading'},
                    { value: 1, name: 'Waiting' },
                ]
            }
        ]
    };
    return workloads_ready;
}