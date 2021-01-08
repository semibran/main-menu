export default function generateCharmap(order, cols, width, height) {
	let charmap = {}
	let x = 0
	let y = 0
	let offset = 0
	for (let char of order) {
		if (x === cols * width) {
			x = 0
			y += height
		}
		charmap[char] = { x, y, width, height, offset }
		x += width
	}
	return charmap
}
