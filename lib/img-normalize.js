import Canvas from "./canvas"
import normalizePixels from "./pixels-normalize"

export default function normalize(image) {
	let context = image.getContext("2d")
	let data = context.getImageData(0, 0, image.width, image.height)
	normalizePixels(data)

	let result = Canvas(image.width, image.height)
	result.putImageData(data, 0, 0)
	return result.canvas
}
