import * as params from "./params"
import * as dissolve from "../../transitions/dissolve"
import colors from "../../palette"
import rgba from "../lib/rgba"
import colerp from "../lib/colerp"
import Canvas from "../lib/canvas"
import recolor from "../lib/img-recolor"
import normalize from "../lib/img-normalize"

export function create(index, offset) {
	let inited = false
	let state = {
		name: "exit",
		time: null,
		done: false,
		anims: [
			{ name: "hop", time: null },
			{ name: "lengthen", time: null },
			{ name: "disperse", time: null }
		],
		index: index,
		offset: offset,
		options: params.options.list.map(option => ({
			id: option.id,
			text: option.text,
			desc: option.desc,
			canvas: null,
			x: null
		})),
		icon: {
			y: 0,
			velocity: -0.75
		},
		update, render
	}

	return state

	function init(view) {
		inited = true
		state.time = view.time
		for (let anim of state.anims) {
			anim.time = view.time
		}

		// cache option text sprites
		for (let i = 0; i < state.options.length; i++) {
			let option = state.options[i]
			option.canvas = view.sprites.Text.display(option.text, colors.light)
			option.x = params.options.x
			if (i === state.index) {
				option.x += params.options.tab
			}
		}

		let option = state.options[state.index]
		state.marker = {
			y: params.options.y + (option.canvas.height + 8) * state.index,
			width: params.options.x + params.options.tab + option.canvas.width,
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

		let origin = [ params.options.x + 24, params.options.y + 8 + state.index * (option.canvas.height + params.options.spacing) ]
		state.particles = new Array(128)
		for (let i = 0; i < state.particles.length; i++) {
			let radians = 2 * Math.PI * Math.random()
			let normal = [ Math.cos(radians), Math.sin(radians) ]
			let velocity = [
				normal[0] * Math.random() * 33,
				normal[1] * Math.random() * 33
			]
			let position = [
				origin[0] + normal[0] * 4,
				origin[1] + normal[1] * 4
			]
			state.particles[i] = {
				position, velocity,
				large: Math.random() < 0.25
			}
		}
	}

	function update(view) {
		if (!state.anims.length) state.done = true
		if (state.done) return
		let time = view.time - state.time
		if (time >= 30) {
			let anim = state.anim
			if (!anim) {
				state.anim = dissolve.create(view.element.width, view.element.height)
			} else {
				anim.update()
			}
		}
		for (let i = 0; i < state.anims.length; i++) {
			let anim = state.anims[i]
			let time = view.time - anim.time
			if (anim.name === "lengthen") {
				state.marker.width += 32
			} else if (anim.name === "hop") {
				let icon = state.icon
				icon.y += icon.velocity
				icon.velocity += 1 / 16
				if (icon.y >= 0) {
					icon.y = 0
					state.anims.splice(i--, 1)
				}
			} else if (anim.name === "disperse") {
				for (let i = 0; i < state.particles.length; i++) {
					let part = state.particles[i]
					part.position[0] += part.velocity[0]
					part.position[1] += part.velocity[1]
					part.velocity[0] *= 0.5
					part.velocity[1] *= 0.5
					if (Math.random() < time / 240) {
						state.particles.splice(i--, 1)
					}
				}
				if (!state.particles.length) {
					state.anims.splice(i--, 1)
				}
			} else if (anim.name === "transition") {

			}
		}
	}

	function render(view) {
		if (!inited) {
			init(view)
		}

		let time = view.time - state.time

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
		let option = state.options[state.index]
		for (let i = 0; i < state.options.length; i++) {
			if (i === state.index) continue
			let option = state.options[i]
			let sprite = option.canvas
			let x = option.x
			let y = params.options.y + i * (sprite.height + params.options.spacing)
			context.drawImage(sprite, x, y)
		}

		// draw marker
		if (state.marker) {
			let d = 5
			let r = 6
			let color = colors.light
			if (time < d * r) {
				let t = Math.min(d, time % d) / d
				let light = colerp(colors.light, colors.white, 0.75)
				color = colerp(light, colors.light, t)
			}
			context.fillStyle = rgba(...color)
			context.fillRect(0, Math.round(state.marker.y) + 1, Math.round(state.marker.width), 20)

			let tab = recolor(view.sprites.tab, colors.light, color)
			context.drawImage(tab, Math.round(state.marker.width), Math.round(state.marker.y) + 1)
		}

		let temp = Canvas(canvas.width, canvas.height)
		if (state.particles.length) {
			for (let i = 0; i < state.particles.length; i++) {
				let part = state.particles[i]
				let size = part.large ? 2 : 1
				if (time % 2 || time < 30) {
					temp.fillStyle = "white"
					temp.fillRect(Math.round(part.position[0]), Math.round(part.position[1]), size, size)
				}
			}
		}
		let frame = Math.floor(time / 2)
		if (frame < view.sprites.burst.length) {
			let circle = view.sprites.burst[frame]
			let origin = [ params.options.x + 24, params.options.y + 8 + state.index * (option.canvas.height + params.options.spacing) ]
			temp.drawImage(circle, origin[0] - circle.width / 2, origin[1] - circle.height / 2)
		}
		// restrict to marker region and draw
		temp.globalCompositeOperation = "destination-in"
		temp.fillRect(0, params.options.y + state.index * (option.canvas.height + params.options.spacing) + 2, canvas.width, 18)
		context.drawImage(temp.canvas, 0, 0)

		// draw highlighted text
		let text = view.sprites.Text.display(option.text)
		let shadow = view.sprites.Text.display(option.text, colors.dark)
		let x = Math.round(option.x)
		let y = params.options.y + state.index * (text.height + 8)
		context.drawImage(shadow, x, y)
		context.drawImage(shadow, x - 1, y - 1)
		context.drawImage(text, x - 2, y - 2)

		let src = view.sprites.icons[params.icons[option.id]]
		let dest = Canvas(src.width, src.height)
		dest.imageSmoothingEnabled = true
		if (time < 32) {
			dest.translate(dest.canvas.width / 2, dest.canvas.height / 2)
			dest.scale(Math.cos(2 * Math.PI * (time % 15) / 15), 1)
			dest.translate(-dest.canvas.width / 2, -dest.canvas.height / 2)
		}
		dest.drawImage(src, 0, 0)
		let icon = normalize(dest.canvas)
		if (icon) {
			let offset = state.icon.y
			let x = params.options.x - 2
			let y = params.options.y + state.index * (text.height + params.options.spacing) + Math.round(offset) + 2
			let shadow = recolor(icon, colors.white, colors.dark)
			context.drawImage(shadow, x + 2, y + 2)
			context.drawImage(shadow, x + 1, y + 1)
			context.drawImage(shadow, x + 1, y + 2)
			context.drawImage(shadow, x, y + 1)
			context.drawImage(icon, x, y)
		}

		// draw description box
		context.drawImage(view.sprites.corner, canvas.width - view.sprites.corner.width, canvas.height - view.sprites.corner.height)
		context.fillStyle = "black"
		context.fillRect(0, canvas.height - 19, canvas.width, 19)

		if (option) {
			let t = Math.min(7, time) / 7
			let y = canvas.height - 14
			let temp = Canvas(canvas.width, canvas.height)
			let text = view.sprites.Text.thin(option.desc)
			let width = text.width + params.desc.spacing
			let copies = canvas.width / width + 1
			for (let i = 0; i < copies; i++) {
				let offset = (time + state.offset) % width - params.desc.offset
				temp.drawImage(text, i * width - offset, canvas.height - 14)
			}

			temp.globalCompositeOperation = "destination-in"
			temp.fillRect(20, canvas.height - params.desc.height, canvas.width - 20, params.desc.height)
			context.drawImage(temp.canvas, 0, 0)
			context.drawImage(view.sprites.icons.info, 4, canvas.height - params.desc.height + 4)
		}

		if (state.anim) {
			context.drawImage(state.anim.layer.canvas, 0, 0)
			if (state.anim.done) {
				state.done = true
			}
		}
	}
}
