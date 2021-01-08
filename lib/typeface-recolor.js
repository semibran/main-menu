import recolor from "./img-recolor"

export default function recolorTypeface(typeface, from, to) {
	if (!to) {
		to = from
		from = [ 255, 255, 255, 255 ]
	}
	let result = {}
	for (let char in typeface) {
		result[char] = recolor(typeface[char], from, to)
	}
	return result
}
