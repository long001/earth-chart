const type_list = [ "正常", "疑似欺诈", "欺诈" ]
const min = 10, max = 30, group_count = 10, scatter_count = 100, scatter_density = 30
const density = .8, scale = 1.3
let node_list = [], links = []
let count = 0;

function getRandomNum(min, max) {
	const range = max - min;
	return (min + Math.round(Math.random() * range));
}

function generateLinks(list, den) {
	let results = []
	for(let y=0;y<den;y++){
		const start = getRandomNum(0, list.length-1)
		const end = getRandomNum(0, list.length-1)
		links.push({
			source: list[start].id,
			target: list[end].id,
			value: Math.random() * scale
		})
	}
	return results
}

for (let i = 0; i <= group_count; i++) {
	const range = getRandomNum(min, max)
	const type = type_list[ getRandomNum(0, 2) ]
	let list = []
	for (let j = 0; j < range; j++) {
		list.push({
			group: i,
			id: count,
			status: type
		})
		count++
	}
	//generate links
	links = links.concat(generateLinks(list, list.length / density))
	node_list = node_list.concat(list)
}

let scattered = []
for (let x = 0; x < scatter_count; x++) {
	scattered.push({
		id: count
	})
	count++
}

links = links.concat(generateLinks(scattered, scatter_density))

node_list = node_list.concat(scattered)

const data = {
	nodes: node_list, links: links
}