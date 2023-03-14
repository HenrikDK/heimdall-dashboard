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