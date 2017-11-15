require('./stylesheets/main.scss')
require('./orbitcontrol')
const axios = require('axios')
//const type_list = [ "正常", "疑似欺诈", "欺诈" ]
const min = 10, max = 30, group_count = 10, scatter_count = 100, scatter_density = 30
const density = .8, scale = 1.3
//let node_list = [], links = []
//let count = 0;
///*
//function formatData(list) {
//	let nodes = [], links = []
//	_.forEach(list, function (group, index) {
//		_.forEach(group.points, function (item) {
//			nodes.push({
//				id: item.fingerprint,
//				status: item.fraudLabel,
//				group: index
//			})
//		})
//
//		_.forEach(group.distances, function (item, index) {
//			let arr = index.split("_")
//			links.push({
//				source: arr[ 0 ],
//				target: arr[ 1 ],
//				value: item
//			})
//		})
//	})
//}
//*/
//function getRandomNum(min, max) {
//	const range = max - min;
//	return (min + Math.round(Math.random() * range));
//}
//
//function generateLinks(list, den) {
//	let results = []
//	for(let y=0;y<den;y++){
//		const start = getRandomNum(0, list.length-1)
//		const end = getRandomNum(0, list.length-1)
//		links.push({
//			source: list[start].id,
//			target: list[end].id,
//			value: Math.random() * scale
//		})
//	}
//	return results
//}
//
//for (let i = 0; i <= group_count; i++) {
//	const range = getRandomNum(min, max)
//	const type = type_list[ getRandomNum(0, 2) ]
//	let list = []
//	for (let j = 0; j < range; j++) {
//		list.push({
//			group: i,
//			id: count,
//			status: type
//		})
//		count++
//	}
//	//generate links
//	links = links.concat(generateLinks(list, list.length / density))
//	node_list = node_list.concat(list)
//}
//
//let scattered = []
//for (let x = 0; x < scatter_count; x++) {
//	scattered.push({
//		id: count
//	})
//	count++
//}
//
//links = links.concat(generateLinks(scattered, scatter_density))
//
//node_list = node_list.concat(scattered)
//
//const data = {
//	nodes: node_list, links: links
//}


const CAMERA_DISTANCE2NODES_FACTOR = 200;

const ForceGraph = Kapsule({
	props: {
		width: {default: window.innerWidth - 350},
		height: {default: window.innerHeight},
		graphData: {
			default: {
				nodes: {},
				links: [] // [from, to]
			}
		},
		numDimensions: {default: 3},
		nodeRelSize: {default: 4}, // volume per val unit
		lineOpacity: {default: 0.2},
		valAccessor: {default: node => node.val},
		nameAccessor: {default: node => node.name},
		colorAccessor: {default: node => node.color},
		warmUpTicks: {default: 0}, // how many times to tick the force engine at init before starting to render
		coolDownTicks: {default: Infinity},
		coolDownTime: {default: 15000} // ms
	},

	init: (domNode, state) => {

		// Setup tooltip
		const toolTipElem = document.createElement('div');
		toolTipElem.classList.add('graph-tooltip');
		domNode.appendChild(toolTipElem);

		// Capture mouse coords on move
		const raycaster = new THREE.Raycaster();
		const mousePos = new THREE.Vector2();
		mousePos.x = -2; // Initialize off canvas
		mousePos.y = -2;
		domNode.addEventListener("mousemove", ev => {
			// update the mouse pos

			const offset = getOffset(domNode),
				relPos = {
					x: ev.pageX - offset.left,
					y: ev.pageY - offset.top
				};
			mousePos.x = (relPos.x / state.width) * 2 - 1;
			mousePos.y = -(relPos.y / state.height) * 2 + 1;

			// Move tooltip
			toolTipElem.style.top = (relPos.y - 40) + 'px';
			toolTipElem.style.left = (relPos.x - 20) + 'px';

			function getOffset(el) {
				const rect = el.getBoundingClientRect(),
					scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
					scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
			}
		}, false);


        //页面绑定鼠标点击事件 //点击方法
        domNode.addEventListener("mousedown", e => {

			raycaster.setFromCamera(mousePos, state.camera);
			const intersects = raycaster.intersectObjects(state.graphScene.children);
            //选中后进行的操作
            if(intersects.length > 0) {
                var obj = intersects[0];
//                document.querySelector("#sidebar").style.opacity="0.5";
                if(obj.object.material.customObject){
                   console.log(JSON.stringify(obj.object.material.customObject.data));
                   document.querySelector("#sidebarDetails").style.display="block";
                   document.querySelector("#sidebar").style.display="none";
                   let resData = obj.object.material.customObject.data;
                   document.querySelector(".number").innerHTML=resData.cell;//关联设备数
                   document.querySelector(".number").innerHTML=resData.cell;//关联设备数
                   document.querySelector(".number").innerHTML=resData.cell;//关联设备数
                }else{
                     document.querySelector("#sidebarDetails").style.display="none";
                     document.querySelector("#sidebar").style.display="block";
                }
            }else{
                document.querySelector("#sidebarDetails").style.display="none";
                document.querySelector("#sidebar").style.display="block";
            }
        }, false);

		// Setup camera
		state.camera = new THREE.PerspectiveCamera();
		state.camera.far = 20000;
		state.camera.position.z = 1000;

		// Setup scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x001128);
//		scene.background = new THREE.Color(0xffffff);
//        scene.background = new THREE.TextureLoader().load('assets/img/1.jpeg');

        var light = new THREE.AmbientLight( 0xff0000 );
        scene.add( light );
        scene.fog = new THREE.Fog(0xffffff,1,1000);
		scene.add(state.graphScene = new THREE.Group());


		// Add lights
		scene.add(new THREE.AmbientLight(0xffffff));
		scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

		// Setup renderer
		state.renderer = new THREE.WebGLRenderer();
		state.renderer.setClearColor(0xffffff)
		domNode.appendChild(state.renderer.domElement);

		// Add camera interaction
		const tbControls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
		tbControls.autoRotate = true;
		tbControls.autoRotateSpeed=.3;

    		function createMesh(geom, imageFile) {
               var texture = THREE.ImageUtils.loadTexture(imageFile);
               var mat = new THREE.MeshPhongMaterial({
                    map:texture,
                    transparent:true,
                    opacity:0.3
               });
               var mesh = new THREE.Mesh(geom, mat);
               return mesh;
            }
    		const sphere = createMesh(new THREE.SphereGeometry(500, 100, 100), "assets/img/1.jpeg");
            sphere.rotation.y = 0;
            sphere.position.x = 0;
            scene.add(sphere);


		// Kick-off renderer
		(function animate() { // IIFE
			// Update tooltip
			raycaster.setFromCamera(mousePos, state.camera);
			const intersects = raycaster.intersectObjects(state.graphScene.children);
			toolTipElem.innerHTML = intersects.length ? intersects[ 0 ].object.name || '' : '';

			// Frame cycle
			tbControls.update();
			state.renderer.render(scene, state.camera);
			requestAnimationFrame(animate);
		})();
	},


	update: state => {
		resizeCanvas();

		while (state.graphScene.children.length) {
			state.graphScene.remove(state.graphScene.children[ 0 ])
		} // Clear the place

		// Build graph with data
		const d3Nodes = [];
		for (let nodeId in state.graphData.nodes) { // Turn nodes into array
			const node = state.graphData.nodes[ nodeId ];
			node._id = nodeId;
			d3Nodes.push(node);
		}
		const d3Links = state.graphData.links.map(link => {
			return {source: link[ 0 ], target: link[ 1 ], value: link[ 2 ]};
		});

		// Add WebGL objects
		d3Nodes.forEach(node => {
			const nodeMaterial = new THREE.MeshLambertMaterial({
				color: state.colorAccessor(node) || 0xffffaa,
				transparent: true
			});
			nodeMaterial.opacity = 0.75;
			nodeMaterial.customObject = node;

			const sphere = new THREE.Mesh(
				new THREE.SphereGeometry(Math.cbrt(state.valAccessor(node) || 1) * state.nodeRelSize, 8, 8),
				nodeMaterial
			);
			sphere.name = state.nameAccessor(node) || '';

			state.graphScene.add(node._sphere = sphere)
		});

		d3Links.forEach(link => {
			const color = state.colorAccessor(state.graphData.nodes[ link.source ])
			const lineMaterial = new THREE.LineBasicMaterial({color: color, transparent: true});
			lineMaterial.opacity = 0.5;
			const line = new THREE.Line(new THREE.Geometry(), lineMaterial);
			line.geometry.vertices = [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0) ];
			line.renderOrder = 10; // Prevent visual glitches of dark lines on top of spheres by rendering them last

			const fromName = getNodeName(link.source),
				toName = getNodeName(link.target);
			if (fromName && toName) {
				line.name = `${fromName} > ${toName}`;
			}

			state.graphScene.add(link._line = line);

			function getNodeName(nodeId) {
				return state.nameAccessor(state.graphData.nodes[ nodeId ]);
			}
		});

		state.camera.lookAt(state.graphScene.position);
		state.camera.position.z = Math.cbrt(d3Nodes.length) * CAMERA_DISTANCE2NODES_FACTOR;

		// Add force-directed layout
		const layout = d3_force.forceSimulation()
			.numDimensions(state.numDimensions)
			.nodes(d3Nodes)
			.force('link', d3_force.forceLink().id(d => d._id).links(d3Links))
			.force('charge', d3_force.forceManyBody())
			.force('center', d3_force.forceCenter())
			.stop();

		for (let i = 0; i < state.warmUpTicks; i++) {
			layout.tick();
		} // Initial ticks before starting to render

		let cntTicks = 0;
		const startTickTime = new Date();
		layout.on("tick", layoutTick).restart();

		layout.force("link")
			.distance(function (d) {
				return d.value * 100
			})
			.strength(function (link) {
				return 1;
			})


		function resizeCanvas() {
			if (state.width && state.height) {
				state.renderer.setSize(state.width, state.height);
				state.camera.aspect = state.width / state.height;
				state.camera.updateProjectionMatrix();
			}
		}

		function layoutTick() {
			if (cntTicks++ > state.coolDownTicks || (new Date()) - startTickTime > state.coolDownTime) {
				layout.stop(); // Stop ticking graph
			}

			// Update nodes position
			d3Nodes.forEach(node => {
				const sphere = node._sphere;
				sphere.position.x = node.x;
				sphere.position.y = node.y || 0;
				sphere.position.z = node.z || 0;
			});

			// Update links position
			d3Links.forEach(link => {
				const line = link._line;

				line.geometry.vertices = [
					new THREE.Vector3(link.source.x, link.source.y || 0, link.source.z || 0),
					new THREE.Vector3(link.target.x, link.target.y || 0, link.target.z || 0)
				];

				line.geometry.verticesNeedUpdate = true;
				line.geometry.computeBoundingSphere();
			});
		}
	}
});

const Graph = ForceGraph()(document.getElementById("graph"));
Graph.resetProps().numDimensions(3)
//const nodes = {};
//data.nodes.forEach(node => {
//	nodes[ node.id ] = node
//});



//Graph.colorAccessor(function (node) {
//	if (node.status === '正常') {
//		return "#7ec23a";
//	} else if (node.status === '欺诈') {
//		return "#f47071";
//	} else if (node.status === '疑似欺诈') {
//		return "#ffb86a";
//	} else {
//		return "#016cc5";
//	}
//}).graphData({
//	nodes: nodes,
//	links: data.links.map(link => [ link.source, link.target, link.value ])
//});

//const Axios = axios.create({
	// baseURL: 'http://test-armor.credoo.com.cn/papp/'
//	baseURL:'http://172.18.16.118:8080/dbscan/demo'
//})
//http://ca-core-stg.paic.com.cn
//axios.get('http://www.kiri.pro:8088/dbscan/dbscan/demo').then(function (response) {
axios.get('/papp/device/clust/analysis.do').then(function (response) {
    console.log(response);//总的数据
    let resData = response.data.data;
    document.querySelector("#sidebarDetails").style.display="none";
    document.querySelector("#sidebar").style.display="block";
//    document.querySelector(".glsbs").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".qzths").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".dydaohao").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".dydaohao2").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".jiataobao").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".jiajinrong").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".jiayijiayao").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".jiajipiao").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".jiawangyou").innerHTML=resData.clusters.length;//关联设备数
//    document.querySelector(".qita").innerHTML=resData.clusters.length;//关联设备数
    var resp = response.data.data;
    var nodes = {};
    var links = [];
    resp.noise.forEach(n => {
        nodes[n.pointId] = n
    });
    resp.cluster.forEach(c => {
        c.points.forEach(n => {
            nodes[n.pointId] = n
        })

        for(var key in c.distance) {
            var value = c.distance[key];
            var ids = key.split('_');
            var id1 = parseInt(ids[0]);
            var id2 = parseInt(ids[1]);
            links.push([id1, id2, value]);
        }
    })

    var data = {nodes: nodes, links: links};
    console.log(data)
    Graph.colorAccessor(function (node) {
        if(node){
            if (node.fraud_label == "正常") {
                  return "#00ff00"//'green'
            } else if (node.fraud_label == "欺诈") {
                return "#f47071"//'red'
            } else if (node.fraud_label == "疑似欺诈") {
                return 'yellow'//
            } else {
                return 'blue'
            }
        }else{
            return 'green'
        }

//      if (node.pointId == 0) {
//          return "#00ff00";
//      } else if (node.pointId % 4 == 0) {
//    		return "#7ec23a";
//    	} else if (node.pointId % 4 == 1) {
//    		return "#f47071";
//    	} else if (node.pointId % 4 == 2) {
//    		return "#ffb86a";
//    	} else {
//    		return "#016cc5";
//    	}
    }).graphData(data);

//    console.log(response);
}).catch(function (error) {
    console.log(error);
});