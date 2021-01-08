const radius = 32
const margin = radius - 1
let diamonds = new Array(radius)
for (let i = 0; i < radius + 1; i++) {
	let size = 1 + i * 2
	let start = [ i, i ]
	let cells = [ start ]
	let drawn = { [start]: true }
	let stack = [
		{ cell: start, steps: 0 }
	]
	while (stack.length) {
		let node = stack.shift()
		let cell = node.cell
		let neighbors = [
			[ cell[0], cell[1] - 1 ],
			[ cell[0], cell[1] + 1 ],
			[ cell[0] - 1, cell[1] ],
			[ cell[0] + 1, cell[1] ],
		]
		if (node.steps + 1 > i) continue
		for (let neighbor of neighbors) {
			if (drawn[neighbor]) continue
			drawn[neighbor] = true
			cells.push(cell)
			stack.push({
				cell: neighbor,
				steps: node.steps + 1
			})
		}
	}
	let canvas = document.createElement("canvas")
	let context = canvas.getContext("2d")
	canvas.width = size
	canvas.height = size
	for (let cell of cells) {
		// context.fillStyle = "white"
		context.fillRect(cell[0], cell[1], 1, 1)
	}
	diamonds[i] = canvas
}

export function create(width, height) {
	let canvas = document.createElement("canvas")
	let context = canvas.getContext("2d")
	canvas.width = width
	canvas.height = height

	let nodes = [ { x: 0, y: 0, t: 0 } ]
	let anim = {
		type: "dissolve",
		done: false,
		time: 0,
		nodes: nodes,
		stack: nodes.slice(),
		state: "enter",
		layer: context,
		update
	}

	function update() {
		++anim.time
		let stack = []
		while (anim.stack.length) {
			let node = anim.stack.shift()
			let next = {
				x: node.x + margin,
				y: node.y,
				t: 0
			}
			if (next.x <= anim.layer.canvas.width + margin) {
				stack.push(next)
				anim.nodes.push(next)
			}
			if (!anim.stack.length) {
				let next = {
					x: node.x,
					y: node.y + margin,
					t: 0
				}
				if (next.y <= anim.layer.canvas.height + margin) {
					stack.push(next)
					anim.nodes.push(next)
				}
			}
		}
		anim.stack = stack
		for (let i = anim.nodes.length; i--;) {
			let node = anim.nodes[i]
			let t = node.t
			node.t += 2
			if (t <= radius) {
				let image = diamonds[t]
				if (anim.state === "exit") {
					anim.layer.globalCompositeOperation = "destination-out"
				}
				anim.layer.drawImage(image, node.x - t, node.y - t)
			} else {
				anim.nodes.splice(i, 1)
			}
		}
		if (!anim.nodes.length) {
			if (anim.state === "enter") {
				anim.done = true
			}
			/*
				let node = { x: 0, y: 0, t: 0 }
				anim.nodes = [ node ]
				anim.stack = [ node ]
				anim.state = "exit"
			} else if (anim.state === "exit") {
				anim.done = true
			}*/
		}
	}

	return anim
}
