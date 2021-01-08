export default function Canvas(width, height) {
	let canvas = document.createElement("canvas")
	let context = canvas.getContext("2d")
	canvas.width = width
	canvas.height = height
	return context
}
