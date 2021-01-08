import listen from "key-state"
import controls from "./controls"
import * as states from "./states"

const width = 384
const height = 256

export function create(sprites) {
	let canvas = document.createElement("canvas")
	let view = {
		sprites: sprites,
		element: canvas,
		fsm: {
			state: states.menu.create()
		},
		keys: listen(window, controls),
		time: 0,
		update, render
	}

	resize()
	window.addEventListener("resize", resize)

	function update() {
	}

	function resize() {
		let scale = Math.min(
			Math.floor(window.innerWidth / width),
			Math.floor(window.innerHeight / height)
		) || 1

		canvas.width = window.innerWidth / scale
		canvas.height = window.innerHeight / scale
		canvas.style.transform = `scale(${scale})`
		render()
	}

	function render() {
		let context = canvas.getContext("2d")
		let state = view.fsm.state
		state.render(view)
		state.update(view)
		if (state.done) {
			if (state.name === "menu") {
				view.fsm.state = states.game.create()
			}
		}
		view.time++
	}

	return view
}
