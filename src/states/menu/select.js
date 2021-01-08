import * as params from "./params"
import colors from "../../palette"
import rgba from "../../../lib/rgba"
import colerp from "../../../lib/colerp"
import Canvas from "../../../lib/canvas"
import recolor from "../../../lib/img-recolor"
import normalize from "../../../lib/img-normalize"

export function create() {
	let inited = false
	let state = {
		name: "select",
		time: null,
		done: false,
		options: params.options.list.map(option => ({
			id: option.id,
			text: option.text,
			desc: option.desc,
			canvas: null,
			x: null
		})),
		index: 0,
		selected: false,
		marker: null,
		prev: null,
		cache: { index: null },
		update, render
	}

	return state

	function init(view) {
		inited = true
		state.time = view.time

		// cache option text sprites
		for (let i = 0; i < state.options.length; i++) {
			let option = state.options[i]
			option.canvas = view.sprites.Text.display(option.text, colors.light)
			option.x = params.options.x
		}

		let option = state.options[state.index]
		state.marker = {
			y: params.options.y + (option.canvas.height + 8) * state.index,
			width: option.x + option.canvas.width,
			velocity: 0
		}

		state.title = (_ => {
			let base = view.sprites.Text.title(params.title.text)
			let dark = recolor(base, colors.white, colors.dark)
			let light = recolor(base, colors.white, colors.light)
			let context = Canvas(base.width + 4, base.height + 4)
			context.drawImage(light, 4, 4)
			context.drawImage(light, 3, 3)
			context.drawImage(dark, 2, 2)
			context.drawImage(dark, 1, 1)
			context.drawImage(base, 0, 0)
			return context.canvas
		})()
	}

	function input(keys) {
		if (state.selected) return
		if ((keys.up === 1 || keys.up > 30 && keys.up % 4 === 0) && !keys.down) {
			--state.index
			if (state.index < 0) {
				if (keys.up === 1) {
					state.index = state.options.length - 1
				} else {
					state.index = 0
				}
			}
		}
		if ((keys.down === 1 || keys.down > 30 && keys.down % 4 === 0) && !keys.up) {
			++state.index
			if (state.index === state.options.length) {
				if (keys.down === 1) {
					state.index = 0
				} else {
					state.index = state.options.length - 1
				}
			}
		}
		if (keys.confirm === 1) {
			state.done = true
		}
	}

	function update(view) {
		input(view.keys)

		// update options
		for (let i = 0; i < state.options.length; i++) {
			let option = state.options[i]
			let target = params.options.x
			if (i === state.index) {
				target += params.options.tab
			}
			option.x += (target - option.x) / 4
		}

		// update marker
		let option = state.options[state.index]
		let target = params.options.y + state.index * (option.canvas.height + params.options.spacing)
		state.marker.y += (target - state.marker.y) / 4
		state.marker.velocity += ((option.x + option.canvas.width - state.marker.width) - state.marker.velocity) / 3
		state.marker.width += state.marker.velocity
	}

	function render(view) {
		if (!inited) {
			init(view)
		}

		if (state.cache.index !== state.index) {
			state.prev = {
				index: state.cache.index,
				time: view.time,
				duration: state.prev
					? view.time - state.prev.time
					: null
			}
			state.cache.index = state.index
		}

		// fill bg
		let canvas = view.element
		let context = canvas.getContext("2d")
		context.fillStyle = rgba(...colors.dark)
		context.fillRect(0, 0, canvas.width, canvas.height)

		// draw banner
		context.fillStyle = rgba(...colors.light)
		context.fillRect(0, 0, canvas.width, 21)
		context.drawImage(view.sprites.banner, 0, 0)

		// draw title
		context.drawImage(state.title, params.title.x - 4, params.title.y - 4)

		// draw options
		for (let i = 0; i < state.options.length; i++) {
			let option = state.options[i]
			let sprite = option.canvas
			let x = option.x
			let y = params.options.y + i * (sprite.height + params.options.spacing)
			context.drawImage(sprite, x, y)
		}

		// draw marker
		if (state.marker) {
			let time = view.time - state.prev.time
			let color = colors.light
			let t = 1 - (Math.cos(2 * Math.PI * (time % 60) / 60) + 1) / 2
			color = colerp(colors.light, colors.white, 0.5 * t)
			context.fillStyle = rgba(...color)
			context.fillRect(0, Math.round(state.marker.y) + 1, Math.round(state.marker.width), 20)

			let tab = recolor(view.sprites.tab, colors.light, color)
			context.drawImage(tab, Math.round(state.marker.width), Math.round(state.marker.y) + 1)
		}

		if (view.time - state.prev.time < 7) {
			// create layer for highlights
			let temp = Canvas(canvas.width, canvas.height)

			// draw highlighted text
			let indices = [ state.index ]
			if (state.prev.index) {
				indices.push(state.prev.index)
			}
			for (let i = 0; i < indices.length; i++) {
				let index = indices[i]
				let option = state.options[index]
				let text = view.sprites.Text.display(option.text, colors.white)
				let y = params.options.y + index * (text.height + params.options.spacing)
				temp.drawImage(text, Math.round(option.x), y)
			}

			// restrict to marker region and draw
			temp.globalCompositeOperation = "destination-in"
			temp.fillRect(0, Math.round(state.marker.y), canvas.width, 20)
			context.drawImage(temp.canvas, 0, 0)
		} else {
			let time = view.time - state.prev.time - 7
			let t = Math.min(7, time) / 7
			let option = state.options[state.index]
			let text = view.sprites.Text.display(option.text)
			let shadow = view.sprites.Text.display(option.text, colors.dark)
			let y = params.options.y + state.index * (text.height + 8)
			context.drawImage(shadow, Math.round(option.x), y)
			if (t > 0.5) {
				context.drawImage(shadow, Math.round(option.x - 1), y - 1)
			}
			context.drawImage(text, Math.round(option.x - t * 2), Math.round(y - t * 2))
			let src = view.sprites.icons[params.icons[option.id]]
			let icon = src
			if (option.id === "option") {
				// obligatory gear rotation
				let dest = Canvas(src.width * Math.SQRT2, src.height * Math.SQRT2)
				dest.imageSmoothingEnabled = true
				dest.translate(dest.canvas.width / 2, dest.canvas.height / 2)
				dest.rotate(2 * Math.PI * (time % 120) / 120)
				dest.translate(-dest.canvas.width / 2, -dest.canvas.height / 2)
				dest.drawImage(src, 2, 2)
				icon = normalize(dest.canvas)
			}
			if (icon) {
				let size = icon.width * t
				let offset = Math.sin(2 * Math.PI * (time % 60) / 60) * 1.5
				let x = params.options.x + 4 - size / 2 - 1
				let y = params.options.y + state.index * (text.height + params.options.spacing) + 8 - size / 2 - 2 + offset
				let shadow = recolor(icon, colors.white, colors.dark)
				context.drawImage(shadow, Math.round(x + 2), Math.round(y + 2), size, size)
				context.drawImage(shadow, Math.round(x + 1), Math.round(y + 2), size, size)
				context.drawImage(shadow, Math.round(x + 1), Math.round(y + 1), size, size)
				context.drawImage(shadow, Math.round(x), Math.round(y + 1), size, size)
				context.drawImage(icon, Math.round(x), Math.round(y), size, size)
			}
		}

		// draw description box
		context.drawImage(view.sprites.corner, canvas.width - view.sprites.corner.width, canvas.height - view.sprites.corner.height)
		context.fillStyle = "black"
		context.fillRect(0, canvas.height - 19, canvas.width, 19)

		// draw description text
		let option = state.options[state.index]
		if (option) {
			let time = view.time - state.prev.time
			let t = Math.min(7, time) / 7
			let y = canvas.height - 14
			let temp = Canvas(canvas.width, canvas.height)
			let text = view.sprites.Text.thin(option.desc)
			if (state.prev.index !== null) {
				let option = state.options[state.prev.index]
				let color = colerp(colors.white, colors.black, t)
				let text = view.sprites.Text.thin(option.desc, color)
				let width = text.width + params.desc.spacing
				let copies = canvas.width / width + 1
				for (let i = 0; i < copies; i++) {
					let offset = state.prev.duration % width - params.desc.offset + time
					temp.drawImage(text, i * width - offset, canvas.height - 14 - 14 * t)
				}
			}

			let width = text.width + params.desc.spacing
			let copies = canvas.width / width + 1
			for (let i = 0; i < copies; i++) {
				let offset = time % width - params.desc.offset
				temp.drawImage(text, i * width - offset, canvas.height - 14 * t)
			}

			temp.globalCompositeOperation = "destination-in"
			temp.fillRect(20, canvas.height - params.desc.height, canvas.width - 20, params.desc.height)
			context.drawImage(temp.canvas, 0, 0)
			context.drawImage(view.sprites.icons.info, 4, canvas.height - params.desc.height + 4)
		}
	}
}
