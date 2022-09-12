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
        formatter: (s) => { return 'Ready: 103\nWaiting:13' }
      },
      emphasis: {
        show: true,
      },
      data: [
        { value: 103, name: 'Ready' },
        { value: 13, name: 'Waiting' },
      ]
    }
  ]
};

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
		height: '90%',
		radius: ['45%', '70%'],
		avoidLabelOverlap: false,
		label: {
		  show: true,
		  position: 'center',
		  fontSize: '16',
		  fontWeight: 'bold',
		  formatter: '103 / 116 \n cores'
		},
		emphasis: {
		  disabled: true,
		  show: false,
		},
		data: [
		  { value: 103, name: 'Used' },
		  { value: 13, name: 'Available' },
		]
	  }
	]
  };

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
		height: '90%',
		radius: ['45%', '70%'],
		avoidLabelOverlap: false,
		label: {
		  show: true,
		  position: 'center',
		  fontSize: '16',
		  fontWeight: 'bold',
		  formatter: '25 / 32\nGiB'
		},
		emphasis: {
		  disabled: true,
		  show: false,
		},
		data: [
		  { value: 25, name: 'Used' },
		  { value: 7, name: 'Available' },
		]
	  }
	]
  };