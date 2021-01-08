import * as params from "./params"
import colors from "../../palette"
import rgba from "../../../lib/rgba"
import recolor from "../../../lib/img-recolor"
import normalize from "../../../lib/img-normalize"
import Canvas from "../../../lib/canvas"

export function create() {
	let inited = false
	let state = {
		name: "enter",
		time: null,
		done: false,
		anims: [
			{ name: "banner", time: null },
			{ name: "desc", time: null },
			{ name: "options", time: null }
		],
		banner: { y: null },
		title: {
			chars: [],
			state: {
				name: "enter",
				time: null
			}
		},
		options: params.options.list.map(option => ({
			id: option.id,
			text: option.text,
			canvas: null,
			x: null
		})),
		marker: {
			width: 0,
			anim: null
		},
		desc: {
			y: -params.desc.height,
			anim: null
		},
		info: {
			x: -params.desc.height,
			anim: null
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
		state.banner.y = -view.sprites.banner.height
		for (let i = 0, x = 0; i < params.title.text.length; i++) {
			let char = params.title.text[i]
			if (char === " ") continue
			let sprite = view.sprites.Text.title(char)
			state.title.chars.push({
				x: params.title.x + x,
				size: 0,
				canvas: sprite
			})
			x += sprite.width + 4
		}
		for (let i = 0; i < state.options.length; i++) {
			let option = state.options[i]
			option.canvas = view.sprites.Text.display(option.text, colors.light)
			option.x = -option.canvas.width
			option.y = params.options.y + i * (option.canvas.height + params.options.spacing)
		}
	}

	function update(view) {
		if (state.done) return
		if (!state.anims.length) state.done = true
		for (let anim of state.anims) {
			let time = view.time - anim.time
			if (anim.name === "banner") {
				if (time >= 5) {
					state.banner.y += 3
				}
				if (state.banner.y >= 0) {
					state.banner.y = 0
					state.anims.push({
						name: "title",
						time: view.time
					})
					state.anims.splice(state.anims.indexOf(anim), 1)
				}
			} else if (anim.name === "title") {
				let title = state.title
				let substate = title.state
				let time = view.time - substate.time
				if (!time) {
					substate.time = view.time
				}
				if (substate.name === "enter") {
					for (let i = 0; i < title.chars.length; i++) {
						let char = title.chars[i]
						let other = title.chars[i - 1]
						if (!other || other.size > 0.5) {
							char.size += (1 - char.size) / 4
						}
					}
					if (time === title.chars.length * 4 + 4) {
						title.state = {
							name: "contract",
							time: view.time
						}
					}
				} else if (substate.name === "contract") {
					if (time < 8) {
						if (time % 2 === 0) {
							for (let i = 0; i < title.chars.length; i++) {
								let char = title.chars[i]
								char.x -= i
							}
						}
					} else {
						title.state = {
							name: "lift",
							time: view.time
						}
					}
				} else if (substate.name === "lift") {
					if (time === 4) {
						state.anims.splice(state.anims.indexOf(anim), 1)
					}
				}
			} else if (anim.name === "options") {
				let options = state.options
				for (let i = 0; i < options.length; i++) {
					let option = options[i]
					let other = options[i - 1]
					if (!other || (params.options.x - other.x) / params.options.x < 0.9375) {
						option.x += (params.options.x - option.x) / 5
					}
				}
				if (time === 50) {
					state.anims.push({
						name: "marker",
						time: view.time
					})
					state.anims.push({
						name: "info",
						time: view.time
					})
				}
				if (time === 55) {
					for (let option of options) {
						option.x = params.options.x
					}
					state.anims.splice(state.anims.indexOf(anim), 1)
				}
			} else if (anim.name === "marker") {
				if (!state.marker.anim) state.marker.anim = anim
				let marker = state.marker
				let option = state.options[0]
				let target = params.options.x
				marker.width += (target + option.canvas.width - marker.width) / 4
				if (time === 10) {
					state.anims.splice(state.anims.indexOf(anim), 1)
				}
			} else if (anim.name === "desc") {
				if (!state.desc.anim) state.desc.anim = anim
				let desc = state.desc
				let speed = params.desc.height / 14
				desc.y += speed
				if (desc.y >= 0) {
					desc.y = 0
					state.anims.splice(state.anims.indexOf(anim), 1)
				}
			} else if (anim.name === "info") {
				if (!state.info.anim) state.info.anim = anim
				let info = state.info
				let speed = params.desc.height / params.info.duration
				info.x += speed
				if (info.x >= 0) {
					info.x = 0
					state.anims.splice(state.anims.indexOf(anim), 1)
				}
			}
		}
	}

	function render(view) {
		if (!inited) {
			init(view)
		}
		let canvas = view.element
		let context = canvas.getContext("2d")
		context.fillStyle = rgba(...colors.dark)
		context.fillRect(0, 0, canvas.width, canvas.height)
		for (let option of state.options) {
			context.drawImage(option.canvas, Math.round(option.x), Math.round(option.y))
		}

		context.fillStyle = rgba(...colors.light)
		context.fillRect(0, state.banner.y, canvas.width, 21)
		context.drawImage(view.sprites.banner, 0, state.banner.y)

		if (state.title.state.name !== "lift") {
			for (let char of state.title.chars) {
				if (!char.size) continue
				let width = Math.round(char.canvas.width * char.size)
				let height = Math.round(char.canvas.height * char.size)
				let temp = Canvas(width, height)
				temp.imageSmoothingEnabled = true
				temp.scale(char.size, char.size)
				temp.drawImage(char.canvas, 0, 0)

				let sprite = normalize(temp.canvas)
				let x = char.x + char.canvas.width / 2 - width / 2
				let y = params.title.y + char.canvas.height / 2 - height / 2
				let shadow = recolor(sprite, colors.white, colors.light)
				context.drawImage(shadow, Math.round(x), Math.round(y))
				context.drawImage(shadow, Math.round(x) - 1, Math.round(y) - 1)
				context.drawImage(sprite, Math.round(x) - 2, Math.round(y) - 2)
			}
		} else {
			let time = view.time - state.title.state.time
			let z = Math.min(4, time) / 4
			for (let char of state.title.chars) {
				let x = Math.round(char.x)
				let y = params.title.y
				let light = recolor(char.canvas, colors.white, colors.light)
				let dark = recolor(char.canvas, colors.white, colors.dark)
				context.drawImage(light, x, y)
				context.drawImage(light, x - 1, y - 1)
				context.drawImage(dark,  x - 2, y - 2)
				context.drawImage(dark,  x - 2 - z, y - 2 - z)
				context.drawImage(char.canvas, x - 2 - z * 2, y - 2 - z * 2)
			}
		}

		let marker = state.marker
		if (marker.width) {
			let y = params.options.y + 1
			context.fillStyle = rgba(...colors.light)
			context.fillRect(0, y, Math.round(marker.width), 20)
			context.drawImage(view.sprites.tab, Math.round(marker.width), y)

			let temp = Canvas(canvas.width, canvas.height)
			let option = state.options[0]
			let text = view.sprites.Text.display(option.text)
			temp.fillRect(0, y - 1, Math.round(marker.width), 20)
			temp.drawImage(view.sprites.tab, Math.round(marker.width), y - 1)
			temp.globalCompositeOperation = "source-in"
			temp.drawImage(text, Math.round(option.x), params.options.y)
			context.drawImage(temp.canvas, 0, 0)
		}

		// draw description text
		let desc = state.desc
		if (desc.anim) {
			let t = 1 + desc.y / params.desc.height
			context.drawImage(view.sprites.corner, canvas.width - view.sprites.corner.width, canvas.height - view.sprites.corner.height * t)
			context.fillStyle = "black"
			context.fillRect(0, canvas.height - 19 - desc.y, canvas.width, 19)
		}

		let info = state.info
		if (info.anim) {
			let x = info.x + params.info.padding
			let y = canvas.height - params.desc.height + params.info.padding
			context.drawImage(view.sprites.icons.info, Math.round(x), y)
		}
	}
}
