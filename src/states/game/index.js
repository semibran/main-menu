import colors from "../../palette"
import colerp from "../../../lib/colerp"
import Canvas from "../../../lib/canvas"
import rgba from "../../../lib/rgba"

export function create() {
	let inited = false
	let state = {
		name: "game",
		done: false,
		time: 0,
		box: {
			image: null,
			y: null
		},
		render, update
	}

	return state

	function init(view) {
		inited = true
		let canvas = view.element
		let box = Canvas(canvas.width - 64, 53)
		box.drawImage(view.sprites.box.topLeft, 0, 0)
		box.drawImage(view.sprites.box.topRight, box.canvas.width - 4, 0)
		box.drawImage(view.sprites.box.bottomLeft, 0, box.canvas.height - 4)
		box.drawImage(view.sprites.box.bottomRight, box.canvas.width - 4, box.canvas.height - 4)

		box.fillStyle = "#666"
		box.fillRect(4, 0, box.canvas.width - 8, 2)
		box.fillRect(0, 4, 2, box.canvas.height - 8)
		box.fillRect(4, box.canvas.height - 3, box.canvas.width - 8, 2)
		box.fillRect(box.canvas.width - 2, 4, 2, box.canvas.height - 8)

		box.fillStyle = "#ccc"
		box.fillRect(4, 2, box.canvas.width - 8, 1)
		box.fillRect(4, box.canvas.height - 1, box.canvas.width - 8, 1)

		state.box = {
			image: box.canvas,
			y: canvas.height
		}
	}

	function render(view) {
		if (!inited) {
			init(view)
		}

		let canvas = view.element
		let context = canvas.getContext("2d")
		context.fillStyle = rgba(...colerp(colors.black, colors.white, state.time / 15))
		context.fillRect(0, 0, canvas.width, canvas.height)
		if (state.time <= 30) {
			// fade to white
		} else if (state.time > 30 && state.time <= 45) {
			let box = state.box
			let time = state.time - 30
			let t = time / 15
			box.y = canvas.height - (box.image.height + 16) * t
			context.drawImage(box.image, 32, box.y)
		} else {
			let box = state.box
			context.drawImage(box.image, 32, box.y)
			let content = [ "Loading save data...", "Do not turn off the power." ]
			let texts = []
			let index = state.time - 45
			if (index <= content[0].length) {
				let slice = content[0].slice(0, index)
				if (slice) {
					texts.push(Text(view.sprites.Text.thin, slice))
				}
			} else {
				let slice = content[1].slice(0, index - content[0].length)
				if (slice) {
					texts.push(Text(view.sprites.Text.thin, content[0]))
					texts.push(Text(view.sprites.Text.thin, slice))
				}
			}
			for (let i = 0; i < texts.length; i++) {
				let text = texts[i]
				let x = 32 + 16
				let y = canvas.height - box.image.height - 16 + 12
				context.drawImage(text, x, y + i * 17)
			}
		}
	}

	function update() {
		state.time++
	}
}

function Text(font, content) {
	let text = font(content, colors.gray)
	let shadow = font(content, colors.silver)
	let context = Canvas(text.width + 1, text.height + 1)
	context.drawImage(shadow, 1, 0)
	context.drawImage(shadow, 0, 1)
	context.drawImage(shadow, 1, 1)
	context.drawImage(text, 0, 0)
	return context.canvas
}
