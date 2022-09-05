function nodeMemoryUsage(){
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
                    formatter: (s) => { return '25 / 32\nGiB'}
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

function nodeCpuUsage(){
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