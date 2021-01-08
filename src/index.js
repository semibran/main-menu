import loadImage from "img-load"
import normalize from "./sprites"
import * as View from "./view"

loadImage("sprites.png").then(main)

function main(spritesheet) {
	let sprites = normalize(spritesheet)
	let view = View.create(sprites)
	document.body.appendChild(view.element)

	setTimeout(loop, 500)

	function loop() {
		view.render()
		view.update()
		requestAnimationFrame(loop)
		// setTimeout(loop, 1000 / 15)
	}
}
