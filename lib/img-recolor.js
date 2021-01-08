import Canvas from "./canvas"
import pixels from "./pixels"

export default function recolor(image, from, to) {
	let context = image.getContext("2d")
	let data = context.getImageData(0, 0, image.width, image.height)
	pixels.replace(data, from, to)

	let result = Canvas(image.width, image.height)
	result.putImageData(data, 0, 0)
	return result.canvas
}
